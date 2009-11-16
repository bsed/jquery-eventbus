/**
 * Tagged EventBus plugin 1.1.4
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

var idsCounter = 0, tagsToIds = {};

$.eventBus = {

	bind : function(tags, fn, ctx) {

		if(typeof tags != 'string') {
			$.each(tags, function(tag) {
				$.eventBus.bind(tag, this, fn); // there is fn = ctx
			});
		}
		else {
			typeof fn.__eb_id == 'undefined' && (fn.__eb_id = ++idsCounter);
			ctx && typeof ctx.__eb_id == 'undefined' && (ctx.__eb_id = ++idsCounter);
			var tagHash = tagsToList(tags).join(' ');
			(tagsToIds[tagHash] || (tagsToIds[tagHash] = {}))[fn.__eb_id + (ctx? ' ' + ctx.__eb_id : '')] = {
				fn  : fn,
				ctx : ctx
			};
		}

		return this;

	},

	unbind : function(tags, fn, ctx) {

		if(typeof tags != 'string') {
			$.each(tags, function(tag) {
				$.eventBus.unbind(tag, this, fn); // there is fn = ctx
			});
		}
		else {
			var tagHash = tagsToList(tags).join(' ');
			tagsToIds[tagHash] && fn?
				tagsToIds[tagHash][fn.__eb_id + (ctx? ' ' + ctx.__eb_id : '')] &&
					delete tagsToIds[tagHash][fn.__eb_id + (ctx? ' ' + ctx.__eb_id : '')] :
				delete tagsToIds[tagHash];
		}

		return this;

	},

	trigger : function(tags, data) {

		var fns = [], uniqIds = {};
		$.each(getTagCombinations(tagsToList(tags)), function() {
			var tags = this;
			tagsToIds[tags] && $.each(tagsToIds[tags], function(id) {
				if(!uniqIds[id]) {
					fns.push({
						tagCount : tags.split(' ').length,
						fn       : this.fn,
						ctx      : this.ctx
					});
					uniqIds[id] = id;
				}
			});
		});
		$.each(fns.sort(function(a, b) {
				return a.tagCount - b.tagCount;
			}), function() {
			this.fn.call(this.ctx || window, data);
		});

		return this;

	}

};

})(jQuery);