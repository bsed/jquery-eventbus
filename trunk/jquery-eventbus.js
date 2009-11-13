/**
 * Tagged EventBus plugin 1.1.0
 *
 * Copyright (c) 2009 Filatov Dmitry (alpha@zforms.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

(function($) {

var tagsToList = function(tags) {
		return ($.isArray(tags)? tags : tags.split(' ')).sort();
	},
	getCombinations = (function() {
		var cache = {};
		return function(length, start) {

			if(typeof start == 'undefined') {
				if(cache[length]) {
					return cache[length];
				}
				start = 0;
			}

			if(start == length - 1) {
				return [[start]];
			}

			var subcombinations = getCombinations(length, start + 1), result = [[start]];
			for(var i = 0; i < subcombinations.length; i++) {
				result.push(subcombinations[i], [start].concat(subcombinations[i]));
			}
			return result;

		};
	})(),
	getTagCombinations = (function() {
		var cache = {};
		return function(tagList) {

			var tagHash = tagList.join(' ');
			if(cache[tagHash]) {
				return cache[tagHash];
			}
			var combinations = getCombinations(tagList.length), result = [];
			for(var i = 0, ilength = combinations.length; i < ilength; i++) {
				var tagCombination = [];
				for(var j = 0, jlength = combinations[i].length; j < jlength; j++) {
					tagCombination.push(tagList[combinations[i][j]]);
				}
				result.push(tagCombination.join(' '));
			}
			return cache[tagHash] = result;

		};
	})();

var fnIdsCounter = 0, tagsToIds = {};

$.eventBus = {

	bind : function(tags, fn) {

		typeof fn.__eb_id == 'undefined' && (fn.__eb_id = ++fnIdsCounter);

		var tagHash = tagsToList(tags).join(' ');
		(tagsToIds[tagHash] || (tagsToIds[tagHash] = {}))[fn.__eb_id] = fn;

		return this;

	},

	unbind : function(tags, fn) {

		if(typeof fn.__eb_id == 'undefined') {
			return;
		}

		var tagHash = tagsToList(tags).join(' ');
		tagsToIds[tagHash] && tagsToIds[tagHash][fn.__eb_id] && delete tagsToIds[tagHash][fn.__eb_id];

		return this;

	},

	trigger : function(tags, data) {

		var calledFns = {};
		$.each(getTagCombinations(tagsToList(tags)), function() {
			tagsToIds[this] && $.each(tagsToIds[this], function(id) {
				if(!calledFns[id]) {
					this.call(window, data);
					calledFns[id] = true;
				}
			});
		});

		return this;

	}

};

})(jQuery);