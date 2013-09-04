var data = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': '/json/data.json',
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

var transforms = {
	'txt': [
		{"tag": "p", "class": "phrase", "html": '${text}'}
	]
};


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
		offsets.push($(this).position());
	});

	return offsets;
}

function connectInstancesOfKeyword(keyword) {
	var canvas = document.getElementById('text-overlay');
    var context = canvas.getContext('2d');

    var offsets = getKeywordPositions(keyword);

    if(offsets < 2) return;

    else {
    	for(i = 0; i < offsets.length - 1; i++) {
    		var from = { 
    			x: offsets[i].top, 
    			y: offsets[i].left 
    		};
    		var to = { 
    			x: offsets[i + 1].top, 
    			y: offsets[i + 1].left 
    		};

    		console.log("drawing line from (" + from.x + "," + from.y + ") to (" + to.x + "," +to.y + ")");
    		context.beginPath();
    		context.moveTo(from.x, from.y);
    		context.lineTo(to.x, to.y);
    		context.stroke();
    	}
    }
}

$(document).ready(function() {
	var text = $("#text");
	text.json2html(data.phrases, transforms.txt);

	var content = text.html();

	console.log("num keywords: " + data.keywords.length);

	for(i = 0; i < data.keywords.length; i++) {
		var searchTerm = data.keywords[i].term;
		console.dir("searching for: " + searchTerm);
		content = content.replace(new RegExp(searchTerm, 'ig'), '<a href="#" data-map="' + data.keywords[i].mapClass + '">$&</a>');		
	}

	// timeout to let things settle... hacky, I know.
	setTimeout(getKeywordPositions, 50);

	text.html(content);
})
