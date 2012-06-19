// source code is best viewed with tab-size at 2 spaces

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

		console.log(response.photos.photo);
		for (var i = 0, l = response.photos.photo.length; i < l; i++) {
			var photo = response.photos.photo[i];
			var image = img.cloneNode();
			var link = a.cloneNode();

			var url = pictureThumb(photo);
			image.src = url;
			image.alt = image.title = photo.title;

			link.appendChild(image);
			link.href = pictureLarge(photo);
			link.target = '_blank';

			link.addEventListener('click', createOverlay);
			link.addEventListener('mouseover', function() {
				showDetails(this);
			});

			var output = li.cloneNode(); 
			output.appendChild(link);

			photosList.appendChild(output);
		}
	}

	// used when new images are loaded
	var removePhotos = function() {
		var photosList = d.getElementById('photos');
		var photos = photosList.children;

		for (var i = photos.length; i--; ) {
			photosList.removeChild(photos[i]);
		}
	}

	// image overlay
	var createOverlay = function(e) {
		var src = e.currentTarget.href;

		var container = d.createElement('div');
		var img = d.createElement('img');

		container.id = 'overlay';
		container.className = 'animate';
		img.src = src;

		container.style.cursor = 'wait';
		container.style.opacity = 0;

		// make the container fade in once the image is loaded
		img.addEventListener('load', function() {
			container.style.cursor = 'pointer';
			container.style.opacity = 1;
		});

		container.appendChild(img);
		d.body.appendChild(container);

		container.addEventListener('click', function(e) {
			removeOverlay(e, container);
			
			// there is no default event so we don't need to stop it
			return false;
		});

		stopEvent(e);
		return false;
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
		detailContainer.id = 'detail';
		detailContainer.style.opacity = 0;
		detailContainer.className = 'animate fast';

		var link = elem.cloneNode(true);
		link.addEventListener('click', createOverlay)
		detailContainer.appendChild(link);

		var headline = d.createElement('h2');
		var title = elem.getElementsByTagName('img')[0].title;

		headline.innerHTML = title;

		detailContainer.appendChild(headline);

		detailContainer.addEventListener('mouseout', function() {
			hideDetails(this);
		});

		elem.parentElement.appendChild(detailContainer);
		detailContainer.style.opacity = 1;
	}

	var hideDetails = function(elem) {
		elem.style.opacity = 0;
		setTimeout(function() {
			elem.parentElement && elem.parentElement.removeChild(elem);
		}, 200);
	}

	if (d.getElementById('photos').children.length === 0) {
		w.addEventListener('load', addPhotos);
		
		// search function
		var getNewPhotos = function (e) {
			var value = d.getElementById('tags').value;
			var script = d.createElement('script');
			script.src = scriptURL(value);
			
			d.head.appendChild(script);

			d.body.style.cursor = 'wait';

			// change the keywords
			var keywords = d.getElementById('keywords');
			keywords.style.opacity = 0;

			setTimeout(function() {
				keywords.innerHTML = value;
				keywords.style.opacity = 1;
			}, 500);

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
		addPhotos();
	}

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

		return 'http://api.flickr.com/services/rest/?format=json&sort=random&method=flickr.photos.search&tags=' + tags + '&tag_mode=all&api_key=6202031574e5d7c896dd4711b2611cc5';
	}

	// Stop Events (taken from mootols)
	function stopEvent (e) {
		if (e.stopPropagation) e.stopPropagation();
		else e.cancelBubble = true;

		if (e.preventDefault) e.preventDefault();
		else e.returnValue = false;
	}		

	// get an element's absolute offset -- used for the detail overlay
	function getOffset (elem) {
		var offset = [elem.offsetLeft, elem.offsetTop]; // x position is index 0, y index 1
		
		/*do {
			offset[0] += elem.offsetLeft - elem.scrollLeft;
			offset[1] += elem.offsetTop - elem.scrollTop;
		} while (elem = elem.offsetParent)*/

		return offset;
	}
}
