const ConstAllNotes = [
	"C",
	"C#",
	"D",
	"D#",
	"E",
	"F",
	"F#",
	"G",
	"G#",
	"A",
	"A#",
	"B",
];

const ConstStaffRootNotes = [
	{
		name: "C",
		cLineOffset: 0,
	},
	{
		name: "D",
		cLineOffset: 1,
	},
	{
		name: "E",
		cLineOffset: 2,
	},
	{
		name: "F",
		cLineOffset: 3,
	},
	{
		name: "G",
		cLineOffset: 4,
	},
	{
		name: "A",
		cLineOffset: 5,
	},
	{
		name: "B",
		cLineOffset: 6,
	},
].flatMap((el) => [
	{
		name: el.name + '',
		cLineOffset: el.cLineOffset,
	},
	{
		name: el.name + 'b',
		cLineOffset: el.cLineOffset,
	},
	{
		name: el.name + 'bb',
		cLineOffset: el.cLineOffset,
	},
	{
		name: el.name + '#',
		cLineOffset: el.cLineOffset,
	},
	{
		name: el.name + '##',
		cLineOffset: el.cLineOffset,
	},
]);
