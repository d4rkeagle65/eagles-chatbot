// @ts-nocheck

interface BSRActiveQueue {
	req_id?: number;
	oa?: number;
	ob?: number;
	od?: number;
	bsr_code?: string;
	bsr_req?: string;
	bsr_req_here?: boolean;
	bsr_name?: string;
	bsr_ts?: Date;
	bsr_length?: number;
	bsr_note?: string;
	sus_remap?: boolean;
	sus_skip?: boolean;
}

interface TwitchUser {
	user_username?: string;
	user_type?: string;
	user_joints?: Date;
	user_lastactivets?: Date;
	user_lurk?: boolean;
}

interface TwitchUsers extends Array<TwitchUser>{}

interface TwitchBadge {
	badge_id?: string;
	badge_url?: string;
}

interface OptionalTwitchBadge {
	badge?: TwitchBadge | {}
}

interface TwitchBadges extends Array<TwitchBadge>{}

interface IndexNum {
	index: number;
}

interface Summary {
	summary: string,
}

export {
	BSRActiveQueue,
	TwitchUser,
	TwitchUsers,
	TwitchBadge,
	TwitchBadges,
	IndexNum,
	Summary,
	OptionalTwitchBadge,
}
