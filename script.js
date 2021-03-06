// source code is best viewed with tab-size at 2 spaces
var _flickrResponses = 0;

function jsonFlickrApi(response) {
	if (response.stat != "ok"){
		return;
 	}
	
	var d = document;
	var w = window;

	var addPhotos = function () {
		// it's faster to create the elements ahead and just clone them in the loop
		var img = d.createElement('img');
		var li = d.createElement('li');
		var photosList = d.getElementById('photos');
		var a = d.createElement('a');
		
		photosList.style.opacity = 1;

		for (var i = 0, l = response.photos.photo.length; i < l; i++) {
			var photo = response.photos.photo[i];
			var image = img.cloneNode(false);
			var link = a.cloneNode(false);

			var url = pictureThumb(photo);
			image.src = url;
			image.alt = image.title = photo.title;

			image.addEventListener('load', function() {
					this.className = 'loaded'; // firefox 13 (ubuntu) doesn't animate, chromium does
					this.removeEventListener('load'); // don't waste memory
			});

			link.appendChild(image);
			link.href = pictureLarge(photo);

			link.setAttribute('data-flickrURL', linkURL(photo));
			link.addEventListener('mouseover', function(e) {
				showDetails(this);
				stopEvent(e);
				return false;
			});

			var output = li.cloneNode(false); 
			output.appendChild(link);

			photosList.appendChild(output);
		}
	}

	// used when new images are loaded
	var removePhotos = function() {
		var photosList = d.getElementById('photos');
		var photos = photosList.children;
		var parent = photosList.parentElement;

		photosList.style.opacity = 0;
		var newList = photosList.cloneNode(false);

		setTimeout(function() {
			parent.removeChild(photosList);
			parent.appendChild(newList);
		}, 500);
	}

	// image overlay
	var createOverlay = function(elem) {
		var src = elem.href;

		var container = d.createElement('div');
		var link = d.createElement('a');
		var img = d.createElement('img');

		container.id = 'overlay';
		container.className = 'animate';

		link.href = elem.getAttribute('data-flickrURL');
		link.target = '_blank';
		
		img.src = src;
		img.title = 'view flickr page';

		container.style.cursor = 'wait';
		container.style.opacity = 0;

		// make the container fade in once the image is loaded
		img.addEventListener('load', function() {
			container.style.cursor = 'no-drop';
			container.style.opacity = 1;
		});

		link.appendChild(img);
		container.appendChild(link);
		d.body.appendChild(container);

		container.addEventListener('click', function(e) {
			removeOverlay(e, container);
			
			// stopEvent(e);
			return false;
		});
	}

	var removeOverlay = function(e, elem) {
		elem.style.cursor = 'auto';
		elem.style.opacity = 0;

		setTimeout(function() {
			d.body.removeChild(elem);
		}, 500); // .5s is defined in css
	}

	// image details
	var showDetails = function(elem) {
		var detailContainer = d.createElement('article');
		detailContainer.style.opacity = 0;
		detailContainer.className = 'detail animate fast';

		var link = elem.cloneNode(true);
		link.addEventListener('click', function(e) {
			createOverlay(this);
			stopEvent(e);
			return false;
		});
		link.addEventListener('mouseout', function(e) {
			hideDetails(detailContainer);
		});

		detailContainer.appendChild(link);

		var headline = d.createElement('h2');
		var title = elem.getElementsByTagName('img')[0].title;

		headline.innerHTML = title;

		// remove article elements that are still here
		var articles = d.getElementsByTagName('article');
		for (var i = articles.length; i--; ) {
			// double check, maybe hideDetails has already removed it
			if (articles[i] && articles[i].parentElement) {
				articles[i].parentElement.removeChild(articles[i]);
			}
		}

		detailContainer.appendChild(headline);

		elem.parentElement.appendChild(detailContainer);
		detailContainer.style.opacity = 1;
	}

	var hideDetails = function(elem) {
		elem.style.opacity = 0;
		setTimeout(function() {
			if (elem && elem.parentElement) {
				elem.parentElement.removeChild(elem);
			}
		}, 200);
	}

	if (_flickrResponses === 0) {
		w.addEventListener('load', addPhotos);
		
		// search function
		var getNewPhotos = function (e) {
			var keywords = d.getElementById('keywords'); // headline
			var newKeywords = d.getElementById('tags').value

			var script = d.createElement('script');
			script.src = scriptURL(newKeywords);
			
			d.head.appendChild(script);

			d.body.style.cursor = 'wait';
		
			// this is all for the headline
			var j = 1; 
			var addNew = function() {
				var to = setTimeout(addNew, 75);

				j++;
				keywords.innerHTML = newKeywords.substr(0, j);

				if (j === newKeywords.length) clearTimeout(to);
			}

			var i = keywords.innerHTML.length;
			var removeOld = function() {
				var to = setTimeout(removeOld, 75);

				i--;
				keywords.innerHTML = keywords.innerHTML.substr(0, i);
				if (i === 0) {
					clearTimeout(to);
					addNew();
				}
			}
			removeOld();

			stopEvent(e);
			return false;
		}
			
		w.addEventListener('load', function() {
			d
				.getElementById('search')
				.addEventListener('submit', getNewPhotos);
		});
	} else {
		d.body.style.cursor = 'auto';

		removePhotos();
		setTimeout(addPhotos, 600);
	}
	
	_flickrResponses++;

	// Utility-Functions: Generieren von Flickr-URLs
	// Dokumentation siehe http://www.flickr.com/services/api/misc.urls.html

	// Die URL des Fotos (Thumbnail):	
	function pictureThumb(photo) {
	 	return "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" +
	 	photo.id + "_" + photo.secret + "_" + "q.jpg";				
	}

	// Die URL des Fotos (Mittel):	
	function pictureMedium(photo) {
	 	return "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" +
	 	photo.id + "_" + photo.secret + "_" + "z.jpg";				
	}

	// Die URL des Fotos (Groß):		
	function pictureLarge(photo) {
	 	return "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" +
	 	photo.id + "_" + photo.secret + "_" + "b.jpg";				
	}
	
	// Die URL zur entsprechenden Seite bei Flickr:
	function linkURL(photo) {	
	 	return "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
	}

	// Script URL
	function scriptURL(keywords) {
		// take all keywords and remove whitespace
		var tags = keywords.split(',').map(function(v) {
			return v.trim().replace();
		}).join(',');

		// remove last comma
		if (tags.substr(-1) == ',') {
			tags = tags.substr(0, tags.length - 1);
		}

		return 'http://api.flickr.com/services/rest/?format=json&sort=random&method=flickr.photos.search&tags=' + encodeURI(tags) + '&tag_mode=all&api_key=6202031574e5d7c896dd4711b2611cc5';
	}

	// Stop Events (taken from mootols)
	function stopEvent (e) {
		if (e.stopPropagation) e.stopPropagation();
		else e.cancelBubble = true;

		if (e.preventDefault) e.preventDefault();
		else e.returnValue = false;
	}
}
