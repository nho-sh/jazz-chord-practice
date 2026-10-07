const ChordListFromText = (list) => {
	return [...new Set(list.trim().split(" "))];
};

const SONG_DEFINITIONS = [
	{ key: "autumn_leaves", chords: "A-7 B7 B7b9 Cmaj7 D-7 D7 Db7 E- E-7 Eb9 F#-7b5 Gmaj7", title: "🍃 Autumn Leaves - Johnny Mercer" },
	{ key: "cold_duck_time", chords: "Bb7 Dbmaj7 Ebmaj7 F7", title: "🦆 Cold Duck Time - Eddie Harris" },
	{ key: "doxy", chords: "Ab7 Bb Bb7 C-7 C7 Eb7 E° F-7 F7 Faug7 G7", title: "🌀 Doxy - Sonny Rollins" },
	{ key: "i_remember_clifford", chords: "A-7b5 A7b9 Ab-7 Abmaj7 A° Bb Bb+7 Bb-7 Bb7 Bb7alt Bb7b9 Bb7sus4 B°7 C-7 C7 C7b9 D-7b5 D7b9 E-7b5 Eb6 Ebmaj7 F F-7 G+7 G-7 G-7b5 G7 G7/B G7b9 Gb-7", title: "💭 I Remember Clifford - Benny Golson" },
	{ key: "in_a_sentimental_mood", chords: "A7 Ab7 Bb-7 Bb7 C7 C7b9 D- D-6 D-7 D-maj7 D7 Dbmaj7 Eb-7 Eb7 Fmaj7 G- G-6 G-7 G-maj7 Gb7", title: "🥹 In a Sentimental Mood - Duke Ellington" },
	{ key: "misty", chords: "A-7 Ab-7 Abmaj7 Bb-7 Bb7 C-7 C7 C7b9 D7 Db7 Eb6 Eb7 Eb7b9 Ebmaj7 F-7 F7 G-7 G-7b5", title: "🌫️ Misty - Erroll Garner" },
	{ key: "moanin", chords: "Ab9 B9 Bb Bb-9 C7 C7#9 Cm7b5 F F7b9 G-7 G7b9 Gm7b5", title: "😩 Moanin' - Charles Mingus" },
	{ key: "saint_james_infirmary", chords: "A7 B Bb7 Bm7 C C# Cdim Dm E Em7b5 F G", title: "🏨 St. James Infirmary" },
	{ key: "song_for_my_father", chords: "C7 C7sus4 Db7 Eb7 Fm7", title: "🧔🏻 Song For My Father - Horace Silver" },
	{ key: "softy_as_a_morning_sunshine", chords: "Bb7 C7 Cm7 D7 Dm7b5 Ebmaj7 Fm7 G7", title: "🌅 Softly, As A Morning Sunshine - Oscar Hammerstein II & Sigmund Romberg" },
	{ key: "straight_no_chaser", chords: "Am7 Bb7 C7 D7 F7 G-7", title: "🏃🏾‍♂️ Straight, No Chaser - Thelonious Monk" },
	{ key: "st_thomas", chords: "A7 Bb7 C C7 D-7 Dm7b5 E-7 Em7b5 F F#° G+7 G7", title: "😇 St. Thomas - Sonny Rollins" },
	{ key: "summertime", chords: "A- A7 B-7 B7 Bb7 C D- D7 E7 F#-7 F7", title: "🌞 Summertime - George Gershwin" },
	{ key: "take_five", chords: "Ab-6 Ab-7 Bb-7 Bb7 Cbmaj7 Db7 Eb- Eb-7 F-7 Gbmaj7", title: "5️⃣ Take Five - Paul Desmond" },
	{ key: "take_the_a_train", chords: "C D-7 D7 D7b5 F G7 G7b9", title: '🚂 Take the "A" Train - Duke Ellington' },
	{ key: "the_girl_from_ipanema", chords: "A-7 B7 C7b9 D7 D7b9 Eb7 F#-7 Fmaj7 G-7 G7 Gb7 Gbmaj7 Gmaj7", title: "🇧🇷 The Girl From Ipanema - Antonio Carlos Jobim" },
	{ key: "waltz_for_debby", chords: "A7 Ab7 Ab°7 Amaj7 Amin7 Bb6 Bbmaj7 Bmin7 C#min7 C7 D7 Dm7 E7 Eb7 F6 F7 Fmaj7 G7 Gb7 Gm7", title: "💃🏻 Waltz For Debby - Bill Evans" },
	{ key: "wave", chords: "A A-7 A7 A7b9 Ab B-7 B7b9 B9 Bb Bb9 Bb°7 C9 D-7 D7b9 Dmaj7 E E7 Ebmaj7 F#+7 F#13 F-7 Fmaj7 G G-6 G-7 G13 Gmaj7", title: "🌊 Wave - Antonio Carlos Jobim" },
	{ key: "yardbird_suite", chords: "A7 B7b9 Bb7 C6 C7 D-7 D7 E-7 E°7 F#°7 F-7 G7", title: "🐦 Yardbird Suite - Charlie Parker" },
];

const ChordLib = {
	// Difficulty levels, gets progressively harder

	// "C C# Db D Eb E F F# Gb G Ab A Bb B"

	1: "A Ab B Bb C C# D Db E Eb F F# G Gb",
	2: "Abm Am Bbm Bm C#m Cm Dbm Dm Ebm Em F#m Fm Gbm Gm",
	3: "Abmaj7 Amaj7 Bbmaj7 Bmaj7 C#maj7 Cmaj7 Dbmaj7 Dmaj7 Ebmaj7 Emaj7 F#maj7 Fmaj7 Gbmaj7 Gmaj7",
	4: "A7 Ab7 B7 Bb7 C#7 C7 D7 Db7 E7 Eb7 F#7 F7 G7 Gb7",
	5: "Aaug Abaug Abdim Adim Baug Bbaug Bbdim Bdim C#aug C#dim Caug Cdim Daug Dbaug Dbdim Ddim Eaug Ebaug Ebdim Edim F#aug F#dim Faug Fdim Gaug Gbaug Gbdim Gdim",
	// TODO: are these ambiguous?
	6: "Absus4 Asus4 Bbsus4 Bsus4 C#sus4 Csus4 Dbsus4 Dsus4 Ebsus4 Esus4 F#sus4 Fsus4 Gbsus4 Gsus4",
	7: "A9 Ab9 Abmaj9 Amaj9 B9 Bb9 Bbmaj9 Bmaj9 C#9 C#maj9 C9 Cmaj9 D9 Db9 Dbmaj9 Dmaj9 E9 Eb9 Ebmaj9 Emaj9 F#9 F#maj9 F9 Fmaj9 G9 Gb9 Gbmaj9 Gmaj9",
};

// Populate ChordLib with songs from SONG_DEFINITIONS
SONG_DEFINITIONS.forEach((song) => {
	ChordLib[song.key] = song.chords;
});

const UnusedChordAliases = [
	// Triads
	// Keep C Cm
	"Maj",
	"maj",
	"M",
	"^",

	"-",
	"min",

	// Sevenths
	// Keep Maj7 ^ 7
	"maj",
	"M7",
	"ma7",
	"Δ",
	"dom",

	// Keep m7, m7b5 °7
	// ""

	// 
	"o",
	
];

// Parsing &
// some sense checking for flaws
Object.keys(ChordLib).forEach((k) => {
	const orig = ChordLib[k];
	ChordLib[k] = ChordListFromText(orig);
	ChordLib[k].sort();

	// test if every chord can be understood
	if (orig !== ChordLib[k].join(" ")) {
		console.log("Incorrect " + k + " should be " + ChordLib[k].join(" "));
	}
	ChordLib[k].forEach((v) => {
		if (Tonal.Chord.get(v).empty) {
			console.log("Bad chord in " + k + " : " + v);
		}
	});
});
