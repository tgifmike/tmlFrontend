export type HowToCategory =
	| 'Start here'
	| 'Build your line check'
	| 'People & devices'
	| 'Settings & reporting';

export type HowToGuide = {
	id: string;
	title: string;
	summary: string;
	category: HowToCategory;
	audience: string;
	steps: string[];
	note?: string;
	keywords: string[];
};

export const HOW_TO_CATEGORIES: HowToCategory[] = [
	'Start here',
	'Build your line check',
	'People & devices',
	'Settings & reporting',
];

export const howToGuides: HowToGuide[] = [
	{
		id: 'recommended-setup-order',
		title: 'Set up a new operation in the right order',
		summary:
			'Follow the shortest path from a new account to a line check your team can use.',
		category: 'Start here',
		audience: 'Managers',
		steps: [
			'Create the account that will contain your locations, users, and devices.',
			'Create a location and confirm its verified address, coordinates, and automatically detected time zone.',
			'Create reusable Options such as Shelf Life, Pan Size, Portion Size, and Tool.',
			'Create stations in the order your team should see them.',
			'Open each station and create its line-check items.',
			'Choose the location’s start day, daily goal, and temperature categories in Settings.',
			'Add PIN users for line checks or invite users who need full web access.',
			'Enroll an iPad or iPhone, complete a test line check, and review the result.',
		],
		note: 'Options come before items because food-prep items use those saved choices during setup.',
		keywords: ['setup', 'onboarding', 'order', 'first line check'],
	},
	{
		id: 'create-account',
		title: 'Create an account',
		summary:
			'Create the top-level workspace that holds locations, users, and enrolled devices.',
		category: 'Start here',
		audience: 'Managers',
		steps: [
			'Open Accounts from the user menu.',
			'Select Create Account.',
			'Enter a unique Account Name.',
			'Select Create Account, then open the new account from the list.',
		],
		note: 'Use a recognizable business or restaurant-group name. Account names must be unique.',
		keywords: ['account', 'business', 'workspace', 'create account'],
	},
	{
		id: 'create-location',
		title: 'Create a location',
		summary:
			'Add a restaurant or operating site and set the local address and time zone.',
		category: 'Start here',
		audience: 'Managers',
		steps: [
			'Open Accounts, then select the account that should own the location.',
			'Select Create Location.',
			'Enter the Location Name, Street, Town, State, and ZIP Code.',
			'Select Create Location, then open the location from the list.',
			'Open Location Settings to confirm the verified coordinates and automatically detected time zone.',
		],
		note: 'The time zone is detected from the verified coordinates. Use the manual override in Location Settings only when the detected result needs correction.',
		keywords: ['location', 'restaurant', 'store', 'address', 'time zone'],
	},
	{
		id: 'create-options',
		title: 'Create options such as “Shelf Life — 2 days”',
		summary:
			'Build reusable choices for food-prep items: tools, shelf life, pan size, and portion size.',
		category: 'Build your line check',
		audience: 'Managers and admins',
		steps: [
			'Open an account, choose a location, then select Options in the location menu.',
			'Open the Shelf Life group and select Add, or select Create Option.',
			'Enter an Option Name such as “2 days.”',
			'Choose Shelf Life as the Option Type and leave the option Active.',
			'Select Create Option. It will now be available when you create or edit a food-prep item.',
		],
		note: 'The same process works for Tool, Pan Size, and Portion Size. Deactivate an option you no longer want available for new item setup.',
		keywords: ['option', 'shelf life', '2 days', 'tool', 'pan size', 'portion size'],
	},
	{
		id: 'create-station',
		title: 'Create and arrange stations',
		summary:
			'Use stations to group the items your team checks in one area or part of the operation.',
		category: 'Build your line check',
		audience: 'Managers',
		steps: [
			'Open the location and select Stations.',
			'Select Create Station.',
			'Enter a unique Station Name, such as “Grill,” “Walk-in,” or “Front Counter.”',
			'Select Create Station.',
			'Drag stations into the order your team should follow during a line check.',
		],
		note: 'Open a station to add its items. A station can also be cloned when another area needs a similar checklist.',
		keywords: ['station', 'area', 'grill', 'walk-in', 'order', 'clone'],
	},
	{
		id: 'create-item',
		title: 'Create a line-check item',
		summary:
			'Add a food-prep item, equipment check, cleanliness check, or general task to a station.',
		category: 'Build your line check',
		audience: 'Managers',
		steps: [
			'Open the location, select Stations, then open the station that should contain the item.',
			'Select Create Item and enter a clear Item name.',
			'Choose the Item type: Food prep, Equipment check, Cleanliness check, or General task.',
			'For Food prep, choose the required Shelf life and Pan size. Turn on Tool, Portion size, or Temperature category when they apply.',
			'Add instructions or notes that will help the employee perform the check consistently.',
			'Review the check criteria, then select Create item.',
		],
		note: 'Create missing options before creating the item. Use the notes field for standards that are specific to your operation.',
		keywords: ['item', 'food prep', 'equipment', 'cleanliness', 'general task', 'criteria'],
	},
	{
		id: 'manage-items-and-options',
		title: 'Edit, reorder, deactivate, or remove setup records',
		summary:
			'Keep stations, items, and options current without losing track of what your team should use.',
		category: 'Build your line check',
		audience: 'Managers',
		steps: [
			'Open the relevant Stations, station detail, or Options page.',
			'Use Edit to change a name or setup detail.',
			'Drag records to change the order shown to the team when reordering is available.',
			'Turn Active off to hide a record from current use while preserving it.',
			'Use Delete only when the record is no longer needed and the app allows it to be removed.',
		],
		note: 'Deactivation is usually safer than deletion for a record that has already been used. Some records cannot be deleted while another record depends on them.',
		keywords: ['edit', 'reorder', 'active', 'inactive', 'delete', 'remove'],
	},
	{
		id: 'create-pin-user',
		title: 'Create a PIN-only line-check user',
		summary:
			'Give an employee access to complete line checks on an enrolled device without full web access.',
		category: 'People & devices',
		audience: 'Managers',
		steps: [
			'Open the account and select Users For Account.',
			'Select Create PIN user.',
			'Enter the Employee name.',
			'Select one or more locations where the employee may complete line checks.',
			'Select Create employee.',
			'Use the PIN action in the user list to view or manage the employee’s device sign-in PIN.',
		],
		note: 'PIN-only employees do not receive an invitation and do not have full web access.',
		keywords: ['pin', 'employee', 'ipad', 'line check user', 'create pin user'],
	},
	{
		id: 'invite-user',
		title: 'Invite a full-access user',
		summary:
			'Invite someone who needs to sign in and use the web application.',
		category: 'People & devices',
		audience: 'Account managers',
		steps: [
			'Open the account and select Users For Account.',
			'Select Invite User.',
			'Enter the user’s details and choose the access requested by the form.',
			'Select Send Invite.',
			'Use the user list to review invitation status, role, location access, and active status.',
		],
		note: 'Use Create PIN user instead when the employee only needs to perform line checks on the shared device.',
		keywords: ['invite', 'user', 'email', 'role', 'access'],
	},
	{
		id: 'understand-devices',
		title: 'Understand the Devices page',
		summary:
			'See which iPads or iPhones are enrolled and whether they can use PIN access for line checks.',
		category: 'People & devices',
		audience: 'Account managers',
		steps: [
			'Open the account and select Devices.',
			'Review the device name and assigned location to identify each device.',
			'Enrolled shows when the device was added; Last seen shows the most recent contact with the service.',
			'PIN Access Active means PIN users can perform line checks on that device.',
			'Select Revoke to remove a device’s line-check access if it is lost, replaced, or should no longer be trusted.',
			'Expand Show revoked devices to review devices whose access was removed.',
		],
		note: 'Removing a revoked device from the view does not restore its access.',
		keywords: ['device', 'ipad', 'iphone', 'enrolled', 'last seen', 'revoke', 'pin access'],
	},
	{
		id: 'start-of-week-and-daily-goal',
		title: 'Choose the start of week, daily goal, and end of day',
		summary:
			'Set the reporting cycle, daily cutoff time, and number of line checks expected each operating day.',
		category: 'Settings & reporting',
		audience: 'Managers',
		steps: [
			'Open the location and select Settings.',
			'Find Line check settings.',
			'Choose the Start Day that matches the beginning of your operational reporting week.',
			'Enter the Daily Goal—the number of completed line checks expected each day.',
			'Choose End of Day—the time when one operating day ends and the next begins. Use midnight for calendar days or a later time such as 3:00 AM for late-night operations.',
			'Select Save Settings.',
		],
		note: 'A restaurant that reports Monday through Sunday should choose Monday. End of Day defaults to midnight. The daily goal and operating-day cutoff feed dashboard reporting.',
		keywords: ['start day', 'start of week', 'daily goal', 'end of day', 'cutoff', 'reporting week', 'target'],
	},
	{
		id: 'temperature-categories',
		title: 'Add or change temperature categories',
		summary:
			'Define the acceptable Fahrenheit range used when an item requires a temperature check.',
		category: 'Settings & reporting',
		audience: 'Managers and admins',
		steps: [
			'Open the location, select Settings, and find Temperature Categories.',
			'To add one, select Add category, enter its name and minimum and maximum temperatures, choose whether it is Active, then select Create category.',
			'To change one, select the pencil beside the category, update the values, then select Save changes.',
			'Turn a category off when it should not be available for new item configurations.',
			'Delete only an unused category; deactivate a category that is already used by items.',
		],
		note: 'The acceptable range is inclusive, and the minimum must be lower than the maximum.',
		keywords: ['temperature', 'category', 'minimum', 'maximum', 'fahrenheit', 'range'],
	},
	{
		id: 'restore-temperature-defaults',
		title: 'Restore default temperature categories',
		summary:
			'Return the four built-in temperature categories to their original names, ranges, and active status.',
		category: 'Settings & reporting',
		audience: 'Managers and admins',
		steps: [
			'Open the location, select Settings, and find Temperature Categories.',
			'Select Restore defaults.',
			'Review the confirmation message, then select Restore defaults again.',
			'Confirm that the built-in categories are active and show the expected ranges.',
		],
		note: 'Restoring defaults resets the four built-in categories. Custom categories are not changed.',
		keywords: ['restore', 'default', 'temperature categories', 'reset'],
	},
	{
		id: 'read-dashboard',
		title: 'Read the location dashboard',
		summary:
			'Use daily and weekly results to see completion progress and the issues that need attention.',
		category: 'Settings & reporting',
		audience: 'Managers and operators',
		steps: [
			'Open an account and choose a location to land on its Dashboard.',
			'Compare Today’s completed checks with the location’s Daily Goal.',
			'Use the weekly totals and averages to understand performance since the selected Start Day.',
			'Review Today’s attention for missing items, out-of-temperature items, and incorrect preparation.',
			'Use top issue items and employee performance to spot repeated problems and coaching opportunities.',
			'Open a recent line check for its item-level details.',
		],
		note: 'The dashboard is a review tool. Investigate the underlying line check before acting on a summary count.',
		keywords: ['dashboard', 'today', 'weekly', 'issue', 'missing', 'out of temperature', 'performance'],
	},
	{
		id: 'review-completed-line-checks',
		title: 'Review completed line checks',
		summary:
			'Find a submitted check, inspect its details and photos, and download a record when needed.',
		category: 'Settings & reporting',
		audience: 'Managers and operators',
		steps: [
			'Open the location and select Line Checks.',
			'Search by team member, choose a date, or change the sort order to find a submission.',
			'Expand the day and completed check you want to review.',
			'Review results, notes, observations, issues, and submitted photos.',
			'Use the download action when you need a PDF record of the completed check.',
		],
		note: 'Clear the filters if an expected line check does not appear in the current result list.',
		keywords: ['completed line check', 'history', 'photo', 'pdf', 'download', 'filter'],
	},
];
