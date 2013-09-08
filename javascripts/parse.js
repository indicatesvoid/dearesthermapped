var data = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'json/data.json',
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

var transforms = {
	'txt': [
		{"tag": "p", "class": "parchment phrase", "id": "${id}", "html": '${text}'}
	]
};

var canvas = {
    id: 'text-overlay',
    element: '',
    context: ''
}

var map = {
    container: $('#map'),
    makePhraseIcons: function() {
        for(p = 0; p < data.phrases.length; p++) {
            var icon = '<div class="unfocused icon" data-phrase="' + data.phrases[p].id + '" style="position: absolute; top:' + data.phrases[p].top + '; left:' + data.phrases[p].left +'">';
            icon += '<img src="img/island/narrative_icon.png" class="phrase-icon" data-dropdown="' + data.phrases[p].id + '_dropdown" data-options="is_hover:true" />';
            icon += '<div id="' + data.phrases[p].id + '_dropdown" class="f-dropdown large icon-tooltip" data-dropdown-content><img src="img/screenshots/' + data.phrases[p].screenshot + '" /></div>'
            icon += '</div>';
            $('#map').append(icon);
        }
    }
}


function getKeywordPositions(keyword) {
	// for(i = 0; i < data.keywords.length; i++) {
	// 	// var searchTerm = '[data-map="' + data.keywords[i].mapClass + '"]';
	// 	// console.log("searching for: " + searchTerm);
	// 	$('[data-map="' + data.keywords[i].mapClass + '"]').each(function() {
	// 		console.log("position of word " + data.keywords[i].term + " : " + $(this).offset().top + " , " + $(this).offset().left);
	// 	});
	// }

	var offsets = new Array();

	$('[data-map="' + keyword + '"]').each(function() {
		// console.log("position of word " + data.keywords[i].term + " : " + $(this).offset().top + " , " + $(this).offset().left);
		var fontSize = $(this).css('font-size');
        var lineHeight = Math.floor(parseInt(fontSize.replace('px', '')) * 0.5);
        var position = $(this).position();
        position.top += lineHeight;
        position.left += 10;
        offsets.push(position);
	});

	return offsets;
}

function connectInstancesOfKeyword(keyword) {
	// var canvas = document.getElementById('text-overlay');
    //    var context = canvas.getContext('2d');

    var offsets = getKeywordPositions(keyword);
    var lineOffset = 0;

    if(offsets < 2) return;

    else {
    	for(i = 0; i < offsets.length - 1; i++) {
    		var from = { 
    			x: offsets[i].left + lineOffset, 
    			y: offsets[i].top + lineOffset 
    		};
    		var to = { 
    			x: offsets[i + 1].left + lineOffset, 
    			y: offsets[i + 1].top + lineOffset 
    		};

    		console.log("drawing line from (" + from.x + "," + from.y + ") to (" + to.x + "," +to.y + ")");
    		canvas.context.beginPath();
    		canvas.context.moveTo(from.x, from.y);
    		canvas.context.lineTo(to.x, to.y);
    		canvas.context.stroke();
    	}
    }
}

function createKeywordLinks(element) {
    // var content = element.html();
    element.find('p').each(function() {
        var content = $(this).html();
        var newContent = $(this).html();
        for(i = 0; i < data.keywords.length; i++) {
            var searchTerm = data.keywords[i].term;
            newContent = newContent.replace(new RegExp(searchTerm, 'ig'), '<a href="#" onClick="return false;" class="keyword" data-map="' + data.keywords[i].id + '">$&</a>'); 
            // if we found a match...
            if(content != newContent) {
                // reset
                content = newContent;
                // add the keyword to the phrase's JSON
                var matched_id = $(this).attr('id');
                for(p = 0; p < data.phrases.length; p++) {
                    if (data.phrases[p].id === matched_id) {
                        // console.log("Adding '" + searchTerm + "' to " + data.phrases[p].id);
                        data.phrases[p].keywords.push(searchTerm);
                    }
                }
            }
        }
        $(this).html(newContent);
    });

    // element.html(content);
}

$(document).ready(function() {

	var text = $("#text");
    var map_container = $('#map');
	text.json2html(data.phrases, transforms.txt);

	// console.log("num keywords: " + data.keywords.length);

    // setTimeout(function() { createKeywordLinks(text) }, 2000);
    createKeywordLinks(text);

    $('.keyword').hover(function() {
        var item = $(this).attr('data-map');
        map_container.find('[data-map=' + item + ']').toggleClass('map-focus');
    })

    $('.keyword').click(function(e) {
        e.preventDefault();

        // what keyword did we click on?
        var keyword = $(this).attr('data-map');

        var matchingPhraseElements = new Array();
        // text.find('[data-map=' + $(this).)

        var lookup_keyword= $(this).attr('data-map');
        
        // loop through each phrase in JSON
        for(p = 0; p < data.phrases.length; p++) {
            // now loop through every keyword in JSON
            for(k = 0; k < data.phrases[p].keywords.length; k++) {
                // console.log("CHECKING ID :: " + data.phrases[p].id + " , KEYWORD :: " + data.phrases[p].keywords[k]);
                if(data.phrases[p].keywords[k] === lookup_keyword) {
                    // we have a match!
                    // grab the phrase id
                    var phrase_id = data.phrases[p].id;
                    console.log("MATCH ID :: " + phrase_id + " , KEYWORD :: " + data.phrases[p].keywords[k]);
                    matchingPhraseElements.push($('#' + phrase_id));
                }
            }
        }

        $(text).find('.phrase').each(function() {
            $(this).addClass('unfocused');
        });

        for(m = 0; m < matchingPhraseElements.length; m++) {
            var elem = matchingPhraseElements[m];
            elem.removeClass('unfocused');
            text.prepend(elem);
            // elem.remove();
        }

        // scroll to top of page
        $('body,html').animate({scrollTop: text.offset().top}, 800);

    });

    map.makePhraseIcons();

    $('.phrase').hover(function() { 
        var thisPhrase = map_container.find('[data-phrase=' + $(this).attr('id') + ']');
        thisPhrase.removeClass('unfocused'); 
        thisPhrase.find('.f-dropdown').addClass('open')
            .css('left', '0px')
            .css('position', 'absolute')
            .css('top', '14px');
    }, function() { 
        var thisPhrase = map_container.find('[data-phrase=' + $(this).attr('id') + ']');
        thisPhrase.addClass('unfocused'); 
        thisPhrase.find('.f-dropdown').removeClass('open');
        thisPhrase.find('.f-dropdown').css('left', '-99999px');
    });

    // setup canvas
    canvas.element = document.getElementById(canvas.id);
    canvas.context = canvas.element.getContext('2d');
    // size canvas to fit
    var canvasSelector = $('#' + canvas.id);
    var parentPadding = canvasSelector.parent().css('padding');
    // console.log(parentPadding);
    canvasSelector.css('margin', '-' + parentPadding);
    canvas.element.width = canvasSelector.parent().width();
    canvas.element.height = canvasSelector.parent().height();

    // timeout to let things settle... hacky, I know.
    // setTimeout(connectInstancesOfKeyword("ipsum"), 10000);
})
