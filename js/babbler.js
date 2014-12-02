//Andoni Garcia's Markov Babbler in JS. 2014

var TABLE = new htable(51);

// =====================================================================
// ====================== Hash Table Structs  ==========================
// =====================================================================

// My general "hash" function. Just assigns a number to the each word
// that is "somewhat" unique. THIS FUNCTION DOES NOT preserve properties
// like backtracking resistance or collision resistance.
function hashFn(word){
	var res = 17;
	for(var i = 0; i < word.length; i++){
		var tmp = word.charCodeAt(i) * 31;
		tmp *= 23;
		res += tmp;
	}
	return res;
}

function list(word){
	this.word = word;
	this.count = 1;
	this.nextWord = undefined;
}

function entry(word){
	this.word = word;
	this.count = 1;
	this.nextWord = undefined;
}

function bucket(entry){
	this.e = entry;
	this.nextBucket = undefined;
}

function htable(nBucks){
	var bucks = [];
	for(var i = 0; i < nBucks; i++){
		bucks.push(undefined);
	}

	this.nBuckets = nBucks;
	this.buckets = bucks;
}

// =====================================================================
// ====================== Membership Testing ===========================
// =====================================================================

function bucketMem(s, b){
	var tmp = b;
	while(tmp != undefined && tmp != null){
		if(tmp.e.word === s)
			return true;
		tmp = tmp.nextBucket;
	}
	return false;
}

function listMem(s, l){
	var tmp = l;
	while(tmp != undefined && tmp != null){
		if(tmp.word === s)
			return true;
		tmp = tmp.nextWord
	}
	return false;
}

function htableMem(s, t){
	var nBucks = t.nBuckets;
	var hash = hashFn(s);
	var whichBucket = hash % nBucks;
	return bucketMem(s, t.buckets[whichBucket]);
}

// =====================================================================
// ====================== Insertion Functions ==========================
// =====================================================================

function endOfSent(s){
	var lastChar = s.charAt(s.length - 1);
	if(lastChar === "." || lastChar === "?" || lastChar === "!")
		return true;
	return false;
}

// Checks that at least 1 character in the String is printable
function isPrintable(s){
	for(var i = 0; i < s.length; i++){
		var c = s.charCodeAt(i);
		if((48 <= c && c <= 57) || (65 <= c && c <= 90) ||
			(97 <= c && c <= 122) || c === 45 || c === 39)
			return true;
	}
	return false;
}

function strCleanup(s, bool){
	var newStr = "";
	for(var i = 0; i < s.length; i++){
		var c = s.charCodeAt(i);
		var d = s.charAt(i);
		if(bool && i === (s.length - 1)){
			if(d === "." || d === "?" || d === "!"){
				newStr += d;
				continue;
			}
		}
		if((47 < c && c < 58) || (64 < c && c < 91) || (96 < c && c < 123) || c === 45 || c === 39)
			newStr += d;
	}
	return newStr;
}

function htableInsert(s, nextW){
	var a = TABLE.nBuckets;
	var b = hashFn(s);
	var hash = b % a;	

	var curr = TABLE.buckets[hash];
	// If the bucket already contains the current word
	if(bucketMem(s, curr)){
		// Finds the appropriate entry
		while(curr.e.word !== s)
			curr = curr.nextBucket;
		var ent = curr.e;
		// Increments the entry's count
		ent.count++;

		// If the entry already contains the next word
		if(listMem(nextW, ent.nextWord)){
			var nextWd = ent.nextWord;
			// Finds the appropriate list
			while(nextWd.word !== nextW)
				nextWd = nextWd.nextWord;
			// Increments the list's count
			nextWd.count++;
			return;
		// The entry does not contain the word
		} else {
			var newL = new list(nextW);
			newL.nextWord = ent.nextWord;
			ent.nextWord = newL;
			return;
		}
	// The bucket does not contain the current word
	} else {
		var lnew = new list(nextW);
		var enew = new entry(s);
		enew.nextWord = lnew;
		var bnew = new bucket(enew);
		bnew.nextBucket = curr;
		TABLE.buckets[hash] = bnew;
		return;
	}
}

// Treats a "file" as a giant array of words
function insertFile(upload){
	var currentWord, nextWord;

	var ct = 0;
	var maxlen = upload.length;
	// Grabs the first word of the array
	currentWord = upload[ct++];
	// Keeps grabbing until it gets a "printable" word
	while(!isPrintable(currentWord) && ct < maxlen)
		currentWord = upload[ct++];
	// Grabs the next word
	while(nextWord = upload[ct++] && ct < maxlen){
		// Keeps grabbing until it gets a "printable" word
		while(!isPrintable(nextWord) && ct < maxlen)
			nextWord = upload[ct++];
		// Checks if currentWord is the end of the sentence
		if(endOfSent(currentWord)){
			// If so, it inserts the next word as EOS and uses the next
			// word as a first word for the next iteration.
			var tmp = strCleanup(currentWord, true);
			htableInsert(tmp, "EOS");
			currentWord = nextWord;
			continue;
		// Else insert it normally
		} else {
			var tmp1 = strCleanup(currentWord, false);
			var tmp2 = strCleanup(nextWord, false);
			htableInsert(tmp1, tmp2);
			currentWord = nextWord;
		}
	}
	// Handling the end case
	var tmp3 = strCleanup(currentWord, true);
	htableInsert(tmp3, "EOS");
	return;
}

// =====================================================================
// ====================== Babbling Functions ===========================
// =====================================================================

function nextWord(e){
	var randNum = Math.floor(Math.random() * e.count);
	var list = e.nextWord;
	while(list != undefined){
		randNum -= list.count;
		if(randNum <= 0)
			return list.word;
		list = list.nextWord;
	}
	return;
}

function firstWord(){
	// Plus one so checks is never zero
	var checks = Math.floor(Math.random() * 5) + 1;
	var randNum = Math.floor(Math.random() * TABLE.nBuckets);
	var bucks = TABLE.buckets[randNum];
	var firstWord = "";
	while(checks != 0){
		if(bucks == undefined){
			randNum = Math.floor(Math.random() * TABLE.nBuckets);
			bucks = TABLE.buckets[randNum];
			continue;
		}
		var tmp = bucks.e.word;
		var c = tmp.charCodeAt(0);
		if(65 <= c && c <= 90){
			checks--;
			firstWord = tmp;
			if(bucks.nextBucket == undefined){
				randNum = Math.floor(Math.random() * TABLE.nBuckets);
				bucks = TABLE.buckets[randNum];
				continue;
			} else {
				bucks = bucks.nextBucket;
				continue;
			}
		}
		if(bucks.nextBucket == undefined){
			randNum = Math.floor(Math.random() * TABLE.nBuckets);
			bucks = TABLE.buckets[randNum];
			continue;
		} else {
			bucks = bucks.nextBucket;
			continue;
		}
	}
	return firstWord;
}

function htableSearch(s){
	var a = TABLE.nBuckets;
	var b = hashFn(s);
	var c = (b % a);
	var bucks = TABLE.buckets[c];
	while(bucks.e.word !== s)
		bucks = bucks.nextBucket;
	return bucks.e;
}

function sentence(){
	var sent = [];

	var words = Math.floor(Math.random() * 25);
	while(words < 2)
		words = Math.floor(Math.random() * 25);
	//Creates the sentence
	var first = firstWord();
	var lastWord = first;
	var e = htableSearch(first);
	while(words !== 0){
		sent.push(e.word);
		if(words > 0)
			sent.push(" ");
		var nxt = nextWord(e);
		lastWord = next;
		if(nxt === "EOS")
			break;
		e = htableSearch(nxt);
		words--;
	}
	if(!(endOfSent(lastWord)))
		sent.push(".");
	return sent.join("");
}

function paragraph(len){
	var par = [];
	par.push("\t");
	while(len !== 0){
		par.push(sentence());
		par.push(" ");
		len--;
	}
	return par.join("");
}

function babble(pars, sents){
	var bab = [];
	while(pars !== 0){
		bab.push(paragraph(sents));
		bab.push("\n");
		pars--;
	}
	return bab.join("");
}

// =====================================================================
// ========================= Initializations ===========================
// =====================================================================

function huckleberryFinnText() {
	var s = "You don't know about me, without you have read a book by the name of The Adventures of Tom Sawyer, but that ain't no matter. That book was made by Mr. Mark Twain, and he told the truth, mainly. There was things which he stretched, but mainly he told the truth. That is nothing. I never seen anybody but lied, one time or another, without it was Aunt Polly, or the widow, or maybe Mary. Aunt Polly- Tom's Aunt Polly, she is- and Mary, and the Widow Douglas, is all told about in that book- which is mostly a true book; with some stretchers, as I said before. Now the way that the book winds up, is this: Tom and me found the money that the robbers hid in the cave, and it made us rich. We got six thousand dollars apiece- all gold. It was an awful sight ofmoney when it was piled up. Well, Judge Thatcher, he took it and put it out at interest, and it fetched us a dollar a day apiece, all the year round- more than a body could tell what to do with. The Widow Douglas, she took me for her son, and allowed she would sivilize me; but it was rough living in the house all the time, considering how dismal regular and decent the widow was in all her ways; and so when I couldn't stand it no longer, I lit out. I got into my old rags, and my sugar-hogshead again, and was free and satisfied. But Tom Sawyer, he hunted me up and said he was going to start a band of robbers and I might join if I would go back to the widow and be respectable.";
	var textArr = s.split(" ");
	return textArr;
}

function settingUp(text){
	insertFile(text);
}

function init(){
	settingUp(huckleberryFinnText());
	console.log("Everything's ready to go");
	var test = babble(1, 1);
	document.getElementById("writeToMe").innerHTML(test);
}


// =====================================================================
// ====================== Debugging Functions ==========================
// =====================================================================

function printList(l){
	var list = l;
	while(list !== undefined){
		console.log("\t"+list.word+" - "+list.count);
		list = list.nextWord;
	}
	return;
}

function printEntry(e){
	var entry = e;
	console.log("   "+entry.word+" - "+entry.count);
	printList(entry.nextWord);
	return;
}

function printBucket(b){
	var bckt = b;
	while(bckt !== undefined){
		printEntry(bckt.e);
		bckt = bckt.nextBucket;
	}
	return;
}

function printHtable(t){
	var tbl = t;
	console.log(t.nBuckets+" buckets");
	for(var i = 0; i < t.nBuckets; i++){
		console.log(i+"\n");
		printBucket(tbl.buckets[i]);
	}
	console.log("END\n");
}