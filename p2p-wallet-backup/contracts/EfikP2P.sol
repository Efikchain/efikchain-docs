// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
}

contract EfikP2P {
    enum Status { None, Open, Taken, Paid, Disputed, Completed, Cancelled }

    struct Offer {
        address seller;
        address buyer;
        address token; // address(0) = native EFIK
        uint256 amount;
        uint64 payWindow;
        uint64 deadline;
        uint64 paidAt;
        uint64 disputedAt;
        Status status;
        string terms;
    }

    uint64 public constant MIN_WINDOW = 15 minutes;
    uint64 public constant MAX_WINDOW = 24 hours;
    uint64 public constant DISPUTE_DELAY = 1 hours;
    uint64 public constant ARBITER_TIMEOUT = 30 days;

    address public arbiter;
    address public pendingArbiter;
    uint256 public offerCount;
    mapping(uint256 => Offer) public offers;
    uint256 private _lock = 1;

    event OfferCreated(uint256 indexed id, address indexed seller, address token, uint256 amount, uint64 payWindow, string terms);
    event OfferTaken(uint256 indexed id, address indexed buyer, uint64 deadline);
    event OfferReopened(uint256 indexed id);
    event MarkedPaid(uint256 indexed id);
    event Disputed(uint256 indexed id, address by);
    event Released(uint256 indexed id);
    event Cancelled(uint256 indexed id);
    event Resolved(uint256 indexed id, bool toBuyer);
    event Split(uint256 indexed id);

    modifier nonReentrant() { require(_lock == 1, "reentrant"); _lock = 2; _; _lock = 1; }

    constructor(address _arbiter) {
        require(_arbiter != address(0), "arbiter");
        arbiter = _arbiter;
    }

    function createOffer(address token, uint256 amount, uint64 payWindow, string calldata terms)
        external payable nonReentrant returns (uint256 id)
    {
        require(amount > 0, "amount");
        require(payWindow >= MIN_WINDOW && payWindow <= MAX_WINDOW, "window");
        require(bytes(terms).length <= 200, "terms");
        if (token == address(0)) {
            require(msg.value == amount, "value");
        } else {
            require(msg.value == 0, "value");
            uint256 balBefore = IERC20(token).balanceOf(address(this));
            _pull(token, msg.sender, amount);
            require(IERC20(token).balanceOf(address(this)) - balBefore == amount, "token");
        }
        id = ++offerCount;
        offers[id] = Offer(msg.sender, address(0), token, amount, payWindow, 0, 0, 0, Status.Open, terms);
        emit OfferCreated(id, msg.sender, token, amount, payWindow, terms);
    }

    function cancelOffer(uint256 id) external nonReentrant {
        Offer storage o = offers[id];
        require(o.status == Status.Open && msg.sender == o.seller, "not allowed");
        o.status = Status.Cancelled;
        _send(o.token, o.seller, o.amount);
        emit Cancelled(id);
    }

    function take(uint256 id) external {
        Offer storage o = offers[id];
        require(o.status == Status.Open, "not open");
        require(msg.sender != o.seller, "own offer");
        o.buyer = msg.sender;
        o.status = Status.Taken;
        o.deadline = uint64(block.timestamp) + o.payWindow;
        emit OfferTaken(id, msg.sender, o.deadline);
    }

    function markPaid(uint256 id) external {
        Offer storage o = offers[id];
        require(o.status == Status.Taken && msg.sender == o.buyer, "not allowed");
        require(block.timestamp <= o.deadline, "late");
        o.status = Status.Paid;
        o.paidAt = uint64(block.timestamp);
        emit MarkedPaid(id);
    }

    function release(uint256 id) external nonReentrant {
        Offer storage o = offers[id];
        require(msg.sender == o.seller, "seller only");
        require(o.status == Status.Taken || o.status == Status.Paid || o.status == Status.Disputed, "state");
        o.status = Status.Completed;
        _send(o.token, o.buyer, o.amount);
        emit Released(id);
    }

    function reclaim(uint256 id) external {
        Offer storage o = offers[id];
        require(msg.sender == o.seller && o.status == Status.Taken && block.timestamp > o.deadline, "not allowed");
        o.buyer = address(0);
        o.deadline = 0;
        o.status = Status.Open;
        emit OfferReopened(id);
    }

    function dispute(uint256 id) external {
        Offer storage o = offers[id];
        require(o.status == Status.Paid, "state");
        require(msg.sender == o.buyer || msg.sender == o.seller, "party only");
        require(block.timestamp >= o.paidAt + DISPUTE_DELAY, "too early");
        o.status = Status.Disputed;
        o.disputedAt = uint64(block.timestamp);
        emit Disputed(id, msg.sender);
    }

    function resolve(uint256 id, bool toBuyer) external nonReentrant {
        Offer storage o = offers[id];
        require(msg.sender == arbiter && o.status == Status.Disputed, "not allowed");
        if (toBuyer) {
            o.status = Status.Completed;
            _send(o.token, o.buyer, o.amount);
        } else {
            o.status = Status.Cancelled;
            _send(o.token, o.seller, o.amount);
        }
        emit Resolved(id, toBuyer);
    }

    function forceSplit(uint256 id) external nonReentrant {
        Offer storage o = offers[id];
        require(o.status == Status.Disputed && block.timestamp >= o.disputedAt + ARBITER_TIMEOUT, "not allowed");
        o.status = Status.Completed;
        uint256 half = o.amount / 2;
        if (!_trySend(o.token, o.buyer, half)) half = 0;
        _send(o.token, o.seller, o.amount - half);
        emit Split(id);
    }

    function proposeArbiter(address a) external {
        require(msg.sender == arbiter && a != address(0), "no");
        pendingArbiter = a;
    }

    function acceptArbiter() external {
        require(msg.sender == pendingArbiter, "no");
        arbiter = msg.sender;
        pendingArbiter = address(0);
    }

    function _pull(address t, address from, uint256 v) private {
        (bool ok, bytes memory d) = t.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, address(this), v));
        require(ok && (d.length == 0 || abi.decode(d, (bool))), "pull failed");
    }

    function _trySend(address t, address to, uint256 v) private returns (bool) {
        if (v == 0) return true;
        if (t == address(0)) {
            (bool ok, ) = to.call{value: v}("");
            return ok;
        }
        (bool ok2, bytes memory d) = t.call(abi.encodeWithSelector(IERC20.transfer.selector, to, v));
        return ok2 && (d.length == 0 || abi.decode(d, (bool)));
    }

    function _send(address t, address to, uint256 v) private {
        require(_trySend(t, to, v), "send failed");
    }
}
