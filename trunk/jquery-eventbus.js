/**
 * Tagged EventBus plugin 1.0.0
 *
 * Copyright (c) 2009 Filatov Dmitry (alpha@zforms.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

(function($) {

var fnIdsCounter = 0, idsToFns = [], tagToIds = {},
	tagsToList = function(tags) {
		return ($.isArray(tags)? tags : tags.split(','));
	};

$.eventBus = {

	bind : function(tags, fn) {

		if(typeof fn.__id == 'undefined') {
			fn.__id = ++fnIdsCounter;
			idsToFns[fnIdsCounter] = {};
		}
		var tagList = tagsToList(tags), tagLength = tagList.length;
		$.each(tagsToList(tags), function() {
			if(typeof idsToFns[fnIdsCounter][this] == 'undefined') {
				idsToFns[fnIdsCounter][this] = { fn : fn, min : tagLength };
			}
			else if(tagLength < idsToFns[fnIdsCounter][this].min) {
				idsToFns[fnIdsCounter][this].min = tagLength;
			}
			(tagToIds[this] || (tagToIds[this] = {}))[fnIdsCounter] = true;
		});
		return this;

	},

	trigger : function(tags, data) {

		var resultIds = {}, counter = 1;
		$.each(tagsToList(tags), function(i) {
			var tag = this, ids = tagToIds[tag];
			if(!ids) {
				return;
			}
			if(i == 0) {
				$.each(ids, function(id) {
					idsToFns[id][tag].min == 1?
						idsToFns[id][tag].fn.call(window, data) :
						resultIds[id] = true;
				});
			}
			else {
				$.each(resultIds, function(id) {
					if(ids[id]) {
						++counter;
						if(idsToFns[id][tag].min <= counter) {
							idsToFns[id][tag].fn.call(window, data);
							delete resultIds[id];
						}
					}
				});
			}
		});
		return this;

	}

};

})(jQuery);