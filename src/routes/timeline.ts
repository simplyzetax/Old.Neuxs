import app from "..";
import { getVersion } from "../aids/request/version.utility";

app.get("/fortnite/api/calendar/v1/timeline", (c) => {

	const memory = getVersion(c);

	const activeEvents = [
		{
			eventType: `EventFlag.Season${memory.season}`,
			activeUntil: config.dates.seasonEnd,
			activeSince: config.dates.seasonStart,
		},
		{
			eventType: `EventFlag.${memory.lobby}`,
			activeUntil: config.dates.seasonEnd,
			activeSince: config.dates.seasonStart,
		},
		{
			"eventType": "EventFlag.Winterfest.Tree",
			"activeUntil": "9999-01-01T00:00:00.000Z",
			"activeSince": "2020-01-01T00:00:00.000Z"
		},
		{
			"eventType": "EventFlag.LTE_WinterFest",
			"activeUntil": "9999-01-01T00:00:00.000Z",
			"activeSince": "2020-01-01T00:00:00.000Z"
		},
		{
			"eventType": "EventFlag.LTE_WinterFest2019",
			"activeUntil": "9999-01-01T00:00:00.000Z",
			"activeSince": "2020-01-01T00:00:00.000Z"
		}
	];

	const todayAtMidnight = new Date();
	todayAtMidnight.setHours(24, 0, 0, 0);
	const todayOneMinuteBeforeMidnight = new Date(todayAtMidnight.getTime() - 1);
	const isoDate = todayOneMinuteBeforeMidnight.toISOString();

	//TODO Re-add version check
	return c.json({
		channels: {
			"client-matchmaking": {
				states: [],
				cacheExpire: config.dates.seasonEnd,
			},
			"client-events": {
				states: [
					{
						validFrom: config.dates.seasonStart,
						activeEvents: activeEvents,
						state: {
							activeStorefronts: [],
							eventNamedWeights: {},
							seasonNumber: memory.season,
							seasonTemplateId: `AthenaSeason:athenaseason${memory.season}`,
							matchXpBonusPoints: 0,
							seasonBegin: config.dates.seasonStart,
							seasonEnd: config.dates.seasonEnd,
							seasonDisplayedEnd: config.dates.seasonDisplayedEnd,
							weeklyStoreEnd: isoDate,
							stwEventStoreEnd: config.dates.stwEventStoreEnd, //TODO: Change to actual date in 24h for example
							stwWeeklyStoreEnd: config.dates.stwEventStoreEnd,
							sectionStoreEnds: {
								Featured: isoDate,
							},
							dailyStoreEnd: isoDate,
						},
					},
				],
				cacheExpire: isoDate,
			},
		},
		eventsTimeOffsetHrs: 0,
		cacheIntervalMins: 10,
		currentTime: new Date().toISOString(),
	});
});