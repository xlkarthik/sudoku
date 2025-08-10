/**
 * Social features and community-related types
 */
export var LeaderboardType;
(function (LeaderboardType) {
    LeaderboardType["GLOBAL"] = "global";
    LeaderboardType["FRIENDS"] = "friends";
    LeaderboardType["COUNTRY"] = "country";
    LeaderboardType["DAILY_CHALLENGE"] = "daily_challenge";
    LeaderboardType["TOURNAMENT"] = "tournament";
})(LeaderboardType || (LeaderboardType = {}));
export var Timeframe;
(function (Timeframe) {
    Timeframe["DAILY"] = "daily";
    Timeframe["WEEKLY"] = "weekly";
    Timeframe["MONTHLY"] = "monthly";
    Timeframe["ALL_TIME"] = "all_time";
})(Timeframe || (Timeframe = {}));
export var TournamentStatus;
(function (TournamentStatus) {
    TournamentStatus["UPCOMING"] = "upcoming";
    TournamentStatus["ACTIVE"] = "active";
    TournamentStatus["COMPLETED"] = "completed";
    TournamentStatus["CANCELLED"] = "cancelled";
})(TournamentStatus || (TournamentStatus = {}));
export var FriendRequestStatus;
(function (FriendRequestStatus) {
    FriendRequestStatus["PENDING"] = "pending";
    FriendRequestStatus["ACCEPTED"] = "accepted";
    FriendRequestStatus["DECLINED"] = "declined";
    FriendRequestStatus["BLOCKED"] = "blocked";
})(FriendRequestStatus || (FriendRequestStatus = {}));
//# sourceMappingURL=social.js.map