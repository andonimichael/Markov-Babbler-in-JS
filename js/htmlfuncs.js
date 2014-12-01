function huckleberryFinnText() {
	var s = "You don't know about me, without you have read a book by the name of The Adventures of Tom Sawyer, but that ain't no matter. That book was made by Mr. Mark Twain, and he told the truth, mainly. There was things which he stretched, but mainly he told the truth. That is nothing. I never seen anybody but lied, one time or another, without it was Aunt Polly, or the widow, or maybe Mary. Aunt Polly- Tom's Aunt Polly, she is- and Mary, and the Widow Douglas, is all told about in that book- which is mostly a true book; with some stretchers, as I said before. Now the way that the book winds up, is this: Tom and me found the money that the robbers hid in the cave, and it made us rich. We got six thousand dollars apiece- all gold. It was an awful sight ofmoney when it was piled up. Well, Judge Thatcher, he took it and put it out at interest, and it fetched us a dollar a day apiece, all the year round- more than a body could tell what to do with. The Widow Douglas, she took me for her son, and allowed she would sivilize me; but it was rough living in the house all the time, considering how dismal regular and decent the widow was in all her ways; and so when I couldn't stand it no longer, I lit out. I got into my old rags, and my sugar-hogshead again, and was free and satisfied. But Tom Sawyer, he hunted me up and said he was going to start a band of robbers and I might join if I would go back to the widow and be respectable."

	var textArr = s.split(" ");
	return textArr;
}

function settingUp(text){
	var nBucks = 157;
	var table = new newHtable(nBucks);
	table = insertFile(text, table);
	return table;
}

function goBabble(){
	var huck = huckleberryFinnText();
	var t = settingUp(huck);
	var bab = babble(5, 5, t);
	var text = bab.join("\n");
	document.getElementById("toBabble").innerHTML = text;
	return;
}