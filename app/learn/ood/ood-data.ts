import type { Lesson } from "../academy-data";

type Scenario = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: Lesson["difficulty"];
  duration: string;
  requirements: string[];
  entities: Array<[string, string]>;
  patterns: string[];
  endpoints: Array<{ method: string; path: string; purpose: string }>;
  invariant: string;
  code: string;
  tests: string[];
};

const buildLesson = (scenario: Scenario, index: number): Lesson => ({
  slug: scenario.slug,
  track: "OOD",
  index: String(index + 1).padStart(2, "0"),
  title: scenario.title,
  subtitle: scenario.subtitle,
  description: scenario.description,
  difficulty: scenario.difficulty,
  duration: scenario.duration,
  diagram: "class",
  nodes: scenario.entities.map(([name, detail]) => ({ name, detail })),
  requirements: scenario.requirements,
  patterns: scenario.patterns,
  endpoints: scenario.endpoints,
  steps: [
    {
      title: "Clarify behavior and invariants",
      summary: `Begin with observable behavior. The central invariant is: ${scenario.invariant}`,
      points: scenario.requirements,
    },
    {
      title: "Assign responsibilities",
      summary:
        "Keep domain rules inside objects, orchestration inside a service, and infrastructure behind ports.",
      points: scenario.entities.map(([name, detail]) => `${name}: ${detail}`),
    },
    {
      title: "Choose patterns deliberately",
      summary: "Each pattern earns its place by isolating a specific source of change.",
      points: scenario.patterns.map(
        (pattern) => `${pattern}: apply it only at the boundary that actually varies.`,
      ),
    },
    {
      title: "Expose the FastAPI contract",
      summary:
        "Validate at the HTTP boundary, call one application service, and return an explicit response model.",
      points: scenario.endpoints.map(
        ({ method, path, purpose }) => `${method} ${path} — ${purpose}`,
      ),
      code: scenario.code,
    },
    {
      title: "Test failure and concurrency",
      summary:
        "The interview is not finished until races, retries, invalid transitions, and recovery are explained.",
      points: scenario.tests,
    },
  ],
});

const scenarios: Scenario[] = [
  {
    slug: "parking-lot",
    title: "Design a parking lot",
    subtitle: "Allocation, tickets, pricing, and concurrent entry gates.",
    description:
      "Model spot compatibility and ticket lifecycle, then expose safe entry and exit commands through FastAPI.",
    difficulty: "Foundation",
    duration: "34 min",
    requirements: [
      "Allocate the smallest compatible available spot",
      "Issue exactly one active ticket per vehicle",
      "Calculate price from duration and vehicle type",
    ],
    entities: [
      ["ParkingLot", "owns floors and policies"],
      ["ParkingFloor", "indexes available spots"],
      ["ParkingSpot", "size + occupancy state"],
      ["ParkingTicket", "entry, exit, amount"],
      ["PricingPolicy", "fee strategy port"],
    ],
    patterns: ["Strategy", "Factory Method", "Repository", "State"],
    endpoints: [
      { method: "POST", path: "/v1/parking/entries", purpose: "allocate a spot" },
      { method: "POST", path: "/v1/parking/tickets/{id}/exit", purpose: "close and price" },
      { method: "GET", path: "/v1/parking/availability", purpose: "read capacity" },
    ],
    invariant: "one occupied spot maps to one active ticket",
    code: `@router.post("/entries", response_model=TicketView, status_code=201)
async def enter(command: EnterRequest, service: ParkingServiceDep):
    ticket = await service.park(
        vehicle_id=command.vehicle_id,
        vehicle_type=command.vehicle_type,
    )
    return TicketView.model_validate(ticket)`,
    tests: [
      "Two gates cannot allocate the same spot",
      "A repeated exit command returns the original receipt",
      "No compatible spot produces a typed capacity error",
    ],
  },
  {
    slug: "elevator-system",
    title: "Design an elevator system",
    subtitle: "Scheduling, direction, door safety, and concurrent requests.",
    description:
      "Separate car state from scheduling policy and make every movement an explicit state transition.",
    difficulty: "Advanced",
    duration: "43 min",
    requirements: [
      "Accept hall and cabin requests",
      "Select a car without starvation",
      "Never move while doors are open",
    ],
    entities: [
      ["ElevatorController", "coordinates cars"],
      ["ElevatorCar", "position + direction"],
      ["Request", "floor + direction"],
      ["Scheduler", "car selection policy"],
      ["Door", "safety state"],
    ],
    patterns: ["Strategy", "State", "Command", "Observer"],
    endpoints: [
      { method: "POST", path: "/v1/elevators/requests", purpose: "submit a hall request" },
      { method: "POST", path: "/v1/elevators/{id}/destinations", purpose: "choose a floor" },
      { method: "GET", path: "/v1/elevators", purpose: "observe car state" },
    ],
    invariant: "a car moves only when its door is closed and locked",
    code: `@router.post("/requests", response_model=DispatchView, status_code=202)
async def request_car(command: HallRequest, dispatcher: DispatcherDep):
    assignment = await dispatcher.assign(
        floor=command.floor,
        direction=command.direction,
    )
    return DispatchView.from_assignment(assignment)`,
    tests: [
      "Door obstruction prevents movement",
      "Scheduler handles opposing-direction requests",
      "A disabled car receives no new work",
    ],
  },
  {
    slug: "atm",
    title: "Design an ATM",
    subtitle: "Authentication, cash inventory, ledger safety, and compensation.",
    description:
      "Coordinate bank authorization and physical cash dispensing without losing money during partial failure.",
    difficulty: "Advanced",
    duration: "45 min",
    requirements: [
      "Authenticate card and PIN without storing the PIN",
      "Dispense valid note combinations",
      "Reverse the debit if cash cannot be dispensed",
    ],
    entities: [
      ["ATM", "session coordinator"],
      ["CardSession", "authenticated state"],
      ["CashDispenser", "note inventory"],
      ["BankPort", "authorization boundary"],
      ["Withdrawal", "auditable transaction"],
    ],
    patterns: ["State", "Adapter", "Chain of Responsibility", "Saga"],
    endpoints: [
      { method: "POST", path: "/v1/atm/sessions", purpose: "start an authenticated session" },
      { method: "POST", path: "/v1/atm/withdrawals", purpose: "withdraw cash" },
      { method: "GET", path: "/v1/atm/accounts/{id}/balance", purpose: "read balance" },
    ],
    invariant: "a completed debit corresponds to confirmed physical dispense",
    code: `@router.post("/withdrawals", response_model=WithdrawalView)
async def withdraw(command: WithdrawalRequest, service: WithdrawalServiceDep):
    result = await service.execute(
        session_id=command.session_id,
        amount=command.amount,
        idempotency_key=command.idempotency_key,
    )
    return WithdrawalView.from_result(result)`,
    tests: [
      "Insufficient notes leave the account unchanged",
      "A timeout after debit triggers compensation",
      "Repeated idempotency keys never dispense twice",
    ],
  },
  {
    slug: "vending-machine",
    title: "Design a vending machine",
    subtitle: "Selection, payment, inventory, change, and state transitions.",
    description:
      "Use a state machine to make invalid actions impossible while keeping payment hardware replaceable.",
    difficulty: "Foundation",
    duration: "31 min",
    requirements: [
      "Select an in-stock product",
      "Accept payment and return exact change",
      "Refund safely when dispense fails",
    ],
    entities: [
      ["VendingMachine", "state transition owner"],
      ["ProductSlot", "price + quantity"],
      ["Payment", "inserted value"],
      ["ChangeMaker", "coin allocation"],
      ["Dispenser", "hardware port"],
    ],
    patterns: ["State", "Strategy", "Command", "Adapter"],
    endpoints: [
      { method: "POST", path: "/v1/vending/selections", purpose: "select a slot" },
      { method: "POST", path: "/v1/vending/payments", purpose: "add payment" },
      { method: "POST", path: "/v1/vending/dispense", purpose: "complete purchase" },
    ],
    invariant: "inventory decreases only after payment and successful dispense",
    code: `@router.post("/dispense", response_model=DispenseView)
async def dispense(command: DispenseRequest, service: VendingServiceDep):
    result = await service.complete_purchase(
        session_id=command.session_id,
        idempotency_key=command.idempotency_key,
    )
    return DispenseView.model_validate(result)`,
    tests: [
      "Out-of-stock selections are rejected",
      "Change shortage causes a full refund",
      "Concurrent purchases cannot drive quantity negative",
    ],
  },
  {
    slug: "movie-ticket",
    title: "Design movie ticket booking",
    subtitle: "Seat holds, expiry, payment, and double-booking prevention.",
    description:
      "Model temporary holds and booking state so popular seats remain correct under extreme contention.",
    difficulty: "Advanced",
    duration: "46 min",
    requirements: [
      "Browse shows and available seats",
      "Hold seats for a bounded checkout window",
      "Confirm exactly one booking after payment",
    ],
    entities: [
      ["Show", "screen + schedule"],
      ["Seat", "physical location"],
      ["SeatHold", "owner + expiry"],
      ["Booking", "confirmed reservation"],
      ["PaymentPort", "external payment"],
    ],
    patterns: ["State", "Repository", "Saga", "Outbox"],
    endpoints: [
      { method: "GET", path: "/v1/shows/{id}/seats", purpose: "list availability" },
      { method: "POST", path: "/v1/seat-holds", purpose: "hold selected seats" },
      { method: "POST", path: "/v1/bookings", purpose: "confirm after payment" },
    ],
    invariant: "a seat belongs to at most one live hold or confirmed booking",
    code: `@router.post("/seat-holds", response_model=HoldView, status_code=201)
async def hold_seats(command: HoldRequest, service: BookingServiceDep):
    hold = await service.hold(
        show_id=command.show_id,
        seat_ids=command.seat_ids,
        customer_id=command.customer_id,
    )
    return HoldView.model_validate(hold)`,
    tests: [
      "Competing holds yield one winner",
      "Expired holds release seats",
      "Payment success plus response loss remains idempotent",
    ],
  },
  {
    slug: "restaurant",
    title: "Design a restaurant system",
    subtitle: "Reservations, tables, orders, kitchen flow, and billing.",
    description:
      "Coordinate front-of-house and kitchen workflows through explicit order and reservation lifecycles.",
    difficulty: "Intermediate",
    duration: "39 min",
    requirements: [
      "Reserve tables by party size and time window",
      "Send ordered items to the correct kitchen station",
      "Split and settle a bill without losing line items",
    ],
    entities: [
      ["Restaurant", "policy boundary"],
      ["Table", "capacity + occupancy"],
      ["Reservation", "time-bound claim"],
      ["Order", "line-item aggregate"],
      ["KitchenTicket", "preparation workflow"],
    ],
    patterns: ["State", "Observer", "Repository", "Strategy"],
    endpoints: [
      { method: "POST", path: "/v1/reservations", purpose: "reserve a table" },
      { method: "POST", path: "/v1/orders", purpose: "open an order" },
      { method: "PATCH", path: "/v1/orders/{id}/items", purpose: "change items" },
    ],
    invariant: "a table has no overlapping active reservations",
    code: `@router.post("/reservations", response_model=ReservationView, status_code=201)
async def reserve(command: ReservationRequest, service: ReservationServiceDep):
    reservation = await service.reserve(
        party_size=command.party_size,
        starts_at=command.starts_at,
    )
    return ReservationView.model_validate(reservation)`,
    tests: [
      "Overlapping table windows are rejected",
      "Cancelled items notify the kitchen",
      "Split payments sum to the immutable bill total",
    ],
  },
  {
    slug: "shipping-locker",
    title: "Design a shipping locker",
    subtitle: "Allocation, delivery, pickup codes, expiry, and recovery.",
    description:
      "Allocate compatible compartments and protect pickup with expiring, single-use credentials.",
    difficulty: "Intermediate",
    duration: "36 min",
    requirements: [
      "Allocate the smallest compatible compartment",
      "Issue a secure expiring pickup credential",
      "Release expired or collected compartments",
    ],
    entities: [
      ["LockerBank", "compartment collection"],
      ["Compartment", "size + state"],
      ["Package", "dimensions + recipient"],
      ["PickupCredential", "hash + expiry"],
      ["AllocationPolicy", "selection strategy"],
    ],
    patterns: ["Strategy", "State", "Adapter", "Repository"],
    endpoints: [
      { method: "POST", path: "/v1/locker-deliveries", purpose: "allocate and deliver" },
      { method: "POST", path: "/v1/locker-pickups", purpose: "redeem a pickup code" },
      { method: "GET", path: "/v1/locker-banks/{id}", purpose: "read capacity" },
    ],
    invariant: "a pickup credential is secret, expiring, and single use",
    code: `@router.post("/locker-pickups", response_model=PickupView)
async def pickup(command: PickupRequest, service: LockerServiceDep):
    result = await service.collect(
        locker_bank_id=command.locker_bank_id,
        credential=command.credential,
    )
    return PickupView.from_result(result)`,
    tests: [
      "A code cannot be replayed",
      "An expired allocation releases its compartment",
      "Wrong-size packages never receive a smaller compartment",
    ],
  },
  {
    slug: "grocery-store",
    title: "Design grocery checkout",
    subtitle: "Catalog, inventory, promotions, cart totals, and receipts.",
    description: "Keep pricing deterministic while inventory and promotions change independently.",
    difficulty: "Intermediate",
    duration: "38 min",
    requirements: [
      "Scan products into a cart",
      "Apply eligible promotions deterministically",
      "Commit inventory and receipt exactly once",
    ],
    entities: [
      ["Product", "SKU + base price"],
      ["InventoryItem", "available quantity"],
      ["Cart", "selected line items"],
      ["Promotion", "eligibility + discount"],
      ["Checkout", "payment orchestration"],
    ],
    patterns: ["Strategy", "Specification", "Composite", "Repository"],
    endpoints: [
      { method: "POST", path: "/v1/carts", purpose: "start a cart" },
      { method: "PATCH", path: "/v1/carts/{id}/items", purpose: "scan an item" },
      { method: "POST", path: "/v1/carts/{id}/checkout", purpose: "pay and commit" },
    ],
    invariant: "the charged total equals the versioned pricing snapshot",
    code: `@router.post("/carts/{cart_id}/checkout", response_model=ReceiptView)
async def checkout(cart_id: UUID, command: CheckoutRequest, service: CheckoutDep):
    receipt = await service.checkout(
        cart_id=cart_id,
        payment_token=command.payment_token,
        idempotency_key=command.idempotency_key,
    )
    return ReceiptView.model_validate(receipt)`,
    tests: [
      "Promotion ordering cannot change the final total",
      "Inventory conflict returns a recoverable error",
      "A retried checkout returns the same receipt",
    ],
  },
  {
    slug: "file-search",
    title: "Design file search",
    subtitle: "Composable filters, indexing, traversal, and bounded resources.",
    description:
      "Build a search model that combines name, size, type, owner, and time predicates safely.",
    difficulty: "Intermediate",
    duration: "35 min",
    requirements: [
      "Combine filters with AND, OR, and NOT",
      "Search indexed metadata without loading file contents",
      "Stream results with cancellation and limits",
    ],
    entities: [
      ["SearchQuery", "filter expression"],
      ["Specification", "composable predicate"],
      ["FileIndex", "metadata lookup port"],
      ["SearchResult", "ranked projection"],
      ["Cursor", "stable pagination"],
    ],
    patterns: ["Specification", "Composite", "Iterator", "Strategy"],
    endpoints: [
      { method: "POST", path: "/v1/files/search", purpose: "execute structured search" },
      { method: "GET", path: "/v1/files/{id}", purpose: "read metadata" },
      { method: "POST", path: "/v1/files/reindex", purpose: "schedule indexing" },
    ],
    invariant: "every search has a bounded scope, result limit, and execution budget",
    code: `@router.post("/files/search", response_model=SearchPage)
async def search(command: SearchRequest, service: FileSearchDep):
    page = await service.search(
        specification=command.to_specification(),
        cursor=command.cursor,
        limit=command.limit,
    )
    return SearchPage.from_domain(page)`,
    tests: [
      "Nested boolean filters preserve precedence",
      "Cancelled requests stop traversal",
      "Cursor pagination does not repeat results",
    ],
  },
  {
    slug: "tic-tac-toe",
    title: "Design tic-tac-toe",
    subtitle: "Rules, turns, win strategies, and immutable move history.",
    description:
      "Use a small game to practice aggregates, state transitions, and replaceable winning rules.",
    difficulty: "Foundation",
    duration: "27 min",
    requirements: [
      "Alternate valid player turns",
      "Reject occupied or out-of-range cells",
      "Detect win or draw after each move",
    ],
    entities: [
      ["Game", "aggregate + lifecycle"],
      ["Board", "cell ownership"],
      ["Move", "immutable event"],
      ["Player", "symbol + identity"],
      ["WinRule", "winning strategy"],
    ],
    patterns: ["State", "Strategy", "Factory Method", "Memento"],
    endpoints: [
      { method: "POST", path: "/v1/games", purpose: "create a game" },
      { method: "POST", path: "/v1/games/{id}/moves", purpose: "make a move" },
      { method: "GET", path: "/v1/games/{id}", purpose: "read board state" },
    ],
    invariant: "only the current player can claim one empty cell per turn",
    code: `@router.post("/games/{game_id}/moves", response_model=GameView)
async def move(game_id: UUID, command: MoveRequest, service: GameServiceDep):
    game = await service.move(
        game_id=game_id,
        player_id=command.player_id,
        row=command.row,
        column=command.column,
    )
    return GameView.from_domain(game)`,
    tests: [
      "A player cannot move twice",
      "No moves are accepted after a terminal state",
      "Every winning line is detected",
    ],
  },
  {
    slug: "blackjack",
    title: "Design blackjack",
    subtitle: "Cards, hands, turns, scoring rules, and game lifecycle.",
    description: "Separate immutable card values from game policy and dealer strategy.",
    difficulty: "Intermediate",
    duration: "37 min",
    requirements: [
      "Deal from a shuffled shoe without duplicates",
      "Score aces as one or eleven correctly",
      "Apply dealer and settlement rules deterministically",
    ],
    entities: [
      ["BlackjackGame", "round state"],
      ["Shoe", "one or more decks"],
      ["Hand", "cards + score"],
      ["Player", "bet + decisions"],
      ["DealerPolicy", "hit/stand strategy"],
    ],
    patterns: ["State", "Strategy", "Factory Method", "Observer"],
    endpoints: [
      { method: "POST", path: "/v1/blackjack/games", purpose: "start a round" },
      { method: "POST", path: "/v1/blackjack/games/{id}/actions", purpose: "hit or stand" },
      { method: "GET", path: "/v1/blackjack/games/{id}", purpose: "read public state" },
    ],
    invariant: "each physical card can be dealt at most once before reshuffle",
    code: `@router.post("/games/{game_id}/actions", response_model=RoundView)
async def act(game_id: UUID, command: PlayerAction, service: BlackjackDep):
    round_state = await service.act(
        game_id=game_id,
        player_id=command.player_id,
        action=command.action,
    )
    return RoundView.from_domain(round_state)`,
    tests: [
      "Ace scoring chooses the highest non-busting value",
      "The dealer policy runs only after players finish",
      "Hidden dealer cards never leak through the response model",
    ],
  },
];

export const oodLessons = scenarios.map(buildLesson);
