;(function(win, doc, undefined) {
	'use strict';

	var Xtndr, xType;

//-------------------------------------------
// Main
//-------------------------------------------	

	var Xtndr = function (something) {
		var type;

		type = Xtndr.type(something);

		return new Xtndr.xType[type](something);
	};

	Xtndr.isNice = true;

	Xtndr.type = function(x) {
		var type = typeof x;
		
		if (type !== 'object') {
			return type;
		}

		return Object.prototype.toString.call(x).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
	};

	Xtndr.url2Obj = function (url) {
		var urlObj   = {};
		var split, partA, partB, partC, partD, pathLastSegment;

		split = url.split('://'); // [http/s/file , ...]

		urlObj.protocol = split[0];
		partB           = split[1]; // all except protocol

		split = partB.split('?');
		partA = split[0];         // sub.domain.co.il:8080/qwe/asd/zxc
		partD = split[1] || null; // a=1&b=2#hash

		// TODO: use indexOf('/') instead of split, splice, split
		split = partA.split('/');
		partA = split.splice(0,1)[0]; // sub.domain.co.il:8080
		partC = (split) ? split.join('/') : null; // qwe/asd/index.html

		split = partA.split(':');
		partA = split[0]; // sub.domain.co.il
		partB = split[1] || null; // 8080

		// port
		if (partB) {
			urlObj.port = partB;
		}

		// domain
		// split = partA.split('.');
		// urlObj.subDomain = split.splice(0,1)[0]; // sub
		// urlObj.domain    = split.join('.');   // domain.co.il
		urlObj.domain    = partA;   // domain.co.il

		split = partC && partC.split('/');

		// path
		if (split.length > 1) {
			// filename check (index.html)
			pathLastSegment = split[split.length - 1].split('.');

			if (pathLastSegment.length > 1) {
				urlObj.fileName = pathLastSegment[0];
				urlObj.fileExt  = pathLastSegment[1];
				urlObj.file     = pathLastSegment.join('.');
			}
			// else {
				urlObj.pathArr = split;
			// }
		}

		if (partD) {
			split = partD.split('#');
			partA = split[0];         // a=1&b=2
			partB = split[1] || null; // hash

			// hash
			if (partB) {
				urlObj.hash = partB;
			}

			// qryStr
			urlObj.qryStr = new X.xType.string(partA).toObj();
		}

		return urlObj;
	};

//-------------------------------------------
// Types
//-------------------------------------------

	Xtndr.xType = {
/* 
 %%  %%  %%  %%  %%   %%  %%%%%   %%%%%%  %%%%%  
 %%% %%  %%  %%  %%% %%%  %%  %%  %%      %%  %% 
 %% %%%  %%  %%  %% % %%  %%%%%   %%%%    %%%%%  
 %%  %%  %%  %%  %%   %%  %%  %%  %%      %%  %% 
 %%  %%   %%%%   %%   %%  %%%%%   %%%%%%  %%  %% 
 */
		number : (function () {

			function XN (num) {
				/* Deal Breaker */ if (win.isNaN(num)) {return null;}
				
				this.Xtndr = true;
				this[0]    = num;

				return this;
			}

			var proto = XN.prototype;
				
			proto.X = function (i) {
				var str   = '' + this[0];
				var _char = str[i];

				return (_char) ? new X.xType.number(_char) : null;
			};

			proto.addCommas = function() {
				var str, arr, index, max;

				var num = this[0];

				str = '' + num;

				if (str.length > 3) {
					arr   = str.split('');
					index = -3;
					max   = arr.length;
					
					while (max + index >= 0) {
						arr.splice(index, 0, ',');

						// include the comma + the last 3 digits
						index -= 4;
					}

					return arr.join('');
				}

				return str;
			};

			proto.isBetween = function (x, y, include) {
				var num = this[0];
				
				if (include) {
					if (num >= x && num <= y) {
						return true;
					}
				}
				else {
					if (num > x && num < y) {
						return true;
					}
				}
				return false;
			};

			proto.pad = function (totalLength, with_) {
				var needed;
				var pad = '';
				var str = '' + this[0];
				var len = str.length;
				
				totalLength = totalLength || 2;
				with_       = (with_) ? ('' + with_) : '0';

				if (len < totalLength) {
					needed = (totalLength - len) / with_.length;
					needed = win.parseInt(needed, 10);

					while (needed--) {
						pad += with_;
					}

					str = pad + str;
				}
				
				return str;
			};

			return XN;
		})(), // number
/* 
  %%%%   %%%%%%  %%%%%   %%%%%%  %%  %%   %%%%  
 %%        %%    %%  %%    %%    %%% %%  %%     
  %%%%     %%    %%%%%     %%    %% %%%  %% %%% 
     %%    %%    %%  %%    %%    %%  %%  %%  %% 
  %%%%     %%    %%  %%  %%%%%%  %%  %%   %%%%  
 */
		string : (function () {

			function XS (str) {
				this.Xtndr = true;
				this[0]    = str;
				this.len   = str.length;

				return this;
			}

			var X        = Xtndr;
			var type     = X.type;
			var proto    = XS.prototype;
			
			var _helpers = {
				rgx2str: function (regex) {
					regex = regex.toString().replace(/\//g, '');
					return regex;
				}
			};

			proto.X = function (i) {
				var str   = this[0];
				var _char = str[i];

				return (_char) ? new X.xType.string(_char) : null;
			};

			proto.forEach = function (fn) {
				var str   = this[0];
				var split = str.split('');

				split.forEach(function(char, i){
					fn.call(this, char, i);
				});

				return this;
			};

			proto.first = function (num) {
				var str = this[0];
				num     = num || 1;
				str     = str.substr(0, num);

				return str;
			};

			proto.last = function (num) {
				var negativeNum;
				var str = this[0];
				
				negativeNum = Math.abs(num || 1) * -1;

				return str.substr(negativeNum);
			};

			proto.toInt = function () {
				var Win = win;
				var str = this[0];
				var num = Win.parseInt(str, 10);

				if (Win.isNaN(num)) {
					str = str.replace(/\D/g, '');
					num = Win.parseInt(str, 10);
				}

				return (!Win.isNaN(num)) ? num : null;
			};

			proto.cut = function (head, tail) {
				var str = this[0];

				if (typeof head === 'undefined') {
					return str.substring(1, str.length-1);
				}
				
				if (head) {
					str = str.substr(head);
				}

				if (tail) {
					str = str.substr(0, str.length-tail);
				}

				return str;
			};

			proto.trim = function (head, tail) {
				var xStr,
					headLen,
					tailLen,
					tailType,
					rgx
				;

				var headType  = type(head);
				var str       = this[0];
				var done_both = 0;
				var rgxStr    = '';

				/* Deal Breaker */ if (headType === 'undefined') {return null;}

				// pass 1 pattern for both
				if (tail === true) {
					tail = head;
				}

				// head is a string
				if (headType === 'string') {
					headLen = head.length;
					str = (this.first(headLen) === head) && this.cut(headLen);

					done_both += 1;
				}
				else if (headType === 'regexp') {
					head = _helpers.rgx2str(head);
				}

				tailType = type(tail);

				// tail is a string
				if (tailType === 'string') {
					tailLen = tail.length;
					xStr = new X.xType.string(str);
					str  = (xStr.last(tailLen) === tail) && xStr.cut(0, tailLen);

					done_both += 1;
				}
				else if (tailType === 'regexp') {
					tail = _helpers.rgx2str(tail);
				}

				// done. both are strings
				if (done_both === 2) {
					return str;
				}

				// add ^___|___$ where necessary
				rgxStr += (head) ? ('^' + head)       : '';
				rgxStr += (head) ? ('|' + tail + '$') : (tail + '$');

				// rgxStr to rgx
				rgx = new RegExp(rgxStr, 'g');

				return str.replace(rgx, '');
			};

			proto.isIn = function (here) {
				var hereType = type(here);

				if (hereType === 'array') {
					return (here.indexOf(this[0]) > -1);
				}
				else if (hereType === 'string') {
					return (here.indexOf(this[0]) > -1);
				}

				return null;
			};

			proto.cap = function (wordSplit) {
				var strArr;
				var str    = this[0];
				var newStr = '';

				if (wordSplit) {
					strArr = str.split(wordSplit);
					
					strArr.forEach(function (word) {
						newStr += new X.xType.string(word).cap() + wordSplit;
					});

					newStr = new X.xType.string(newStr).cut(0, wordSplit.length);
					return newStr;
				}

				// only first letter
				newStr = str.charAt(0).toUpperCase() + this.cut(1);

				return newStr;
			};

			proto.isCap = function(i) {
				var letter;

				i      = i || 0;
				letter = this[0].charAt(i);

				if (letter && /[A-Z]/.test(letter)) {
					return true;
				}

				return false;
			};

			proto.split = function (by) {
				var arr;
				var str  = this[0];

				if (this.first() === by) {
					this[0] = this.cut(1);
				}

				if (this.last() === by) {
					str = this.cut(0, 1);
				}

				arr = str.split(by);

				return arr;
			};

			proto.splitOnce = function(by) {
				var str   = this[0];
				var i     = str.indexOf(by);
				var first = this.first(i);
				var last  = new X.xType.string(str).cut(i + 1);

				return [first, last];
			};

			proto.has = function (x) {
				var match;
				var str   = this[0];
				var xType = type(x);

				if (xType === 'string') {
					return (str.indexOf(x) > -1);
				}
				else if (xType === 'regexp') {
					match = str.match(x);
					return x.test(str);
				}
			};

			proto.toObj = function (pairSplit, keyValSplit) {
				var pairs;
				var obj = {};
				var str = win.decodeURIComponent(this[0]);

				pairSplit   = pairSplit   || '&';
				keyValSplit = keyValSplit || '=';
				
				pairSplit   = (typeof pairSplit   === 'string') ? new RegExp(pairSplit)   : pairSplit  ;
				keyValSplit = (typeof keyValSplit === 'string') ? new RegExp(keyValSplit) : keyValSplit;

				pairs = new X.xType.string(str).split(pairSplit);

				pairs.forEach(function(pair) {
					var item = pair.split(keyValSplit);

					if (item.length > 2) {
						obj[item.shift()] = item.join(keyValSplit.toString().replace(/^(\/)|(\/[gim]*)$/g, ''));
					} 
					else {
						obj[item[0]] = item[1];
					}
				});

				return obj;
			};

			return XS;
		})(), // string
/* 
  %%%%   %%%%%   %%%%%    %%%%   %%  %% 
 %%  %%  %%  %%  %%  %%  %%  %%   %%%%  
 %%%%%%  %%%%%   %%%%%   %%%%%%    %%   
 %%  %%  %%  %%  %%  %%  %%  %%    %%   
 %%  %%  %%  %%  %%  %%  %%  %%    %%   
 */
		array : (function () {
			
			function XA (arr) {
				this.Xtndr = true;
				this[0]    = arr;
				this.len   = arr.length;

				return this;
			}

			var X     = Xtndr;
			var type  = X.type;
			var proto = XA.prototype;

			proto.X = function (i) {
				var item = this[0][i];

				return (item) ? X(item) : null;
			};

			proto.isEmpty = function() {
				return (this.len === 0);
			};

			proto.forEach = function (fn) {
				var item, i, returned;

				var newArr = [];
				var arr    = this[0];
				var size   = arr.length;
				
				for (i = 0; i < size; i+=1) {
					item = arr[i];

					returned = fn.call(this, item, i);

					if (returned === true){
						continue;
					}
					else if (returned === false) {
						break;
					}
					else if (typeof returned !== 'undefined') {
						newArr.push(returned);
					}
				}

				if (newArr !== []) {
					return newArr;
				}
			};	

			proto._forEach = function (fn) {
				var item, i, returned;

				var newArr = [];
				var arr    = this[0];
				var size   = arr.length;
				
				for (i = arr.length-1; i >= 0; i-=1) {
					item = arr[i];

					returned = fn.call(this, item, i);

					if (returned === true){
						continue;
					}
					else if (returned === false) {
						break;
					}
					else if (typeof returned !== 'undefined') {
						newArr.push(returned);
					}
				}

				if (newArr !== []) {
					return newArr;
				}
			};

			proto.f_forEach = function (fn) {
				var item, i, returned;

				var newArr = [];
				var arr    = this[0];
				var size   = arr.length;

				for (i = arr.length-1; i >= 0; i-=1) {
					item = arr[i];

					fn.call(this, item, i);
				}
			};

			proto.has = function (x) {
				return (this[0].indexOf(x) > -1);
			};

			proto.remove = function (i, howMany) {
				var orgArr;
				var arr = this[0];

				/* Deal Breaker */ if (!arr[i]) {return null;}

				orgArr  = arr.slice(0);
				howMany = howMany || 1;

				if (i === 0 && howMany === 1) {
					arr.shift();
				}
				else {
					arr.splice(i, howMany);
				}

				this[0] = orgArr;

				return arr;
			};

			proto.add = function (what, where) {
				var arr    = this[0];
				var orgArr = arr.slice(0);

				if (where) {
					if (where === 0) {
						return arr.unshift(what);
					}

					arr.splice(where, 0, what);
				}
				else {
					arr.push(what);
				}

				this[0] = orgArr;

				return arr;
			};

			proto.first = function (add) {
				var arr    = this[0];
				var orgArr = arr.slice(0);

				if (add) {
					arr.unshift(add);
					
					this[0] = orgArr;

					return arr;
				}

				return arr[0];
			};

			proto.last = function () {
				return this[0][this.len-1];
			};

			return XA;
		})(), // array

/* 
  %%%%   %%%%%   %%%%%%  %%%%%%   %%%%   %%%%%% 
 %%  %%  %%  %%      %%  %%      %%  %%    %%   
 %%  %%  %%%%%       %%  %%%%    %%        %%   
 %%  %%  %%  %%  %%  %%  %%      %%  %%    %%   
  %%%%   %%%%%    %%%%   %%%%%%   %%%%     %%   
 */
		object : (function () {
			function XO (obj) {
				this.Xtndr = true;
				this[0]    = obj;

				return this;
			}

			var X     = Xtndr;
			var proto = XO.prototype;

			proto.X = function (key) {
				var item = this[0][key];

				return (item) ? X(item) : null;
			};

			proto.isEmpty = function () {
				var key;

				var obj = this[0];

				var hasOwnProp = Object.prototype.hasOwnProperty;

				for (key in obj) {
					if (hasOwnProp.call(obj, key)) {
						return false;
					}
				}
				return true;
			};

			proto.forIn = function (fn) {
				var key, value;

				var obj = this[0];
				var hasOwnProp = Object.prototype.hasOwnProperty;

				for (key in obj) {
					if (hasOwnProp.call(obj, key)) {
						value = obj[key];
						fn.apply(obj, [key, value]);
					}
				}

				return this;
			};

			proto.toStr = function (keyValSplit, pairSplit) {
				var str     = '';
				var obj     = this[0];

				keyValSplit = keyValSplit || '=';
				pairSplit   = pairSplit   || '&';

				this.forIn(function (key, value) {
					str += key + keyValSplit + value + pairSplit;
				});

				str = new X.xType.string(str).cut(0, pairSplit.length);

				return str;
			};

			return XO;
		})(), // object
	};

//-------------------------------------------
// Expose
//-------------------------------------------	

	win.X = Xtndr;

	console.clear();
	console.log('Xtndr Loaded [local]');

}(this)); // SandBox