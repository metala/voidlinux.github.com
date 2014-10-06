(function(w,d){
	var minsize = 2;
	var timeout = -1;
	var maxResults = 200;
	var showAll = false;
	var repos = [
		"http://repo.voidlinux.eu/current/",
		"http://repo.voidlinux.eu/current/multilib/",
		"http://repo.voidlinux.eu/current/nonfree/",
		"http://repo.voidlinux.eu/current/multilib/nonfree/",
		"http://repo.voidlinux.eu/current/debug/"
	];
	var repoNames = [
		"current",
		"multilib",
		"nonfree",
		"multilib/nonfree",
		"debug"
	]
	var currentRepo = 0;
	var reg = /<a href=[^>]*>([^<]*)-([^<-]*)_([0-9]+)\.([^.]*)\.xbps<\/a>.*\s([0-9]+)$/gm;
	var r;
	var idx = 0;
	var results = [];
	function handleResponse() {
		var box = d.getElementById('voidSearch_box');
		if(r.readyState == 4) {
			currentRepo++;
			if(currentRepo != repos.length) {
				startSearch();
			}
			else
				box.className = '';
		}
		addResults();
		render();
	}
	function addResults() {
		var match;
		reg.lastIndex = idx;
		while(match = reg.exec(r.responseText)) {
			idx = reg.lastIndex;
			results.push({
				haystack: (match[1]+" "+match[2]+" "+match[3]+" "+match[4]+" "+repoNames[currentRepo]).toLowerCase(),
				name: match[1],
				version: match[2],
				revision: match[3],
				arch: match[4],
				size: match[5],
				repo: repoNames[currentRepo]
			});
		}
	}

	function render() {
		var a, tli, li, i, j, found = 0
		  , container = d.getElementById("voidSearch_result")
		  , list = d.createElement('ul')
		  , empty = true
		  , footer = d.createElement('div')

		if(needle.join("").length < minsize) {
			table.innerHTML = "";
			return;
		}

		tli = d.createElement('li');
		tli.innerHTML = "<a class=name></a>"
			+"<div class=version><b>Version: </b></div>"
			+"<div class=revision><b>Revsion: </b></div>"
			+"<div class=arch><b>Arch: </b></div>"
			+"<div class=repo><b>Repo: </b></div>"
			+"<div class=size><b>Size: </b></div>";
		container.innerHTML = "";
		for(i = 0; i < results.length; i++) {
			if(found > maxResults && !showAll)
				break;
			for(j = 0; j < needle.length; j++)
				if(results[i].haystack.indexOf(needle[j]) == -1) break;
			if(j != needle.length)
				continue;
			found++;

			empty = false;
			li = tli.cloneNode(true);
			li.childNodes[0].href = 'https://github.com/voidlinux/void-packages/tree/master/srcpkgs/' + results[i].name;
			li.childNodes[0].appendChild(d.createTextNode(results[i].name));
			li.childNodes[1].appendChild(d.createTextNode(results[i].version));
			li.childNodes[2].appendChild(d.createTextNode(results[i].revision));
			li.childNodes[3].appendChild(d.createTextNode(results[i].arch));
			li.childNodes[4].appendChild(d.createTextNode(results[i].repo));
			li.childNodes[5].appendChild(d.createTextNode(results[i].size));
			list.appendChild(li);
		}
		container.appendChild(list);
		tr = d.createElement("tr");
		if(r.readyState != 4)
			footer.innerHTML = "Loading...";
		else if(found > maxResults)
			footer.innerHTML="More than "+maxResults+" results. <a href='javascript:void(window.voidSearch(true));'>show all</a>";
		else if(empty && r.readyState == 4)
			footer.innerHTML="No Results";
		else
			return;
		container.appendChild(footer);
	}
	function startSearch() {
		r = new XMLHttpRequest();
		r.open("GET", repos[currentRepo], true);
		idx = 0;

		r.onreadystatechange = handleResponse
		box.className = 'loading';
		r.send();
	}
	w.voidSearch = function(sa) {
		var box = d.getElementById('voidSearch_box');
		needle = box.value.toLowerCase().trim().split(/\s+/);
		showAll = !!sa;

		if(r) {
			if(timeout != -1)
				clearTimeout(timeout);
			timeout = setTimeout(function() {
				timeout = -1;
				render();
			}, 500);
		}
		else {
			startSearch();
		}
	}
	var box = d.getElementById('voidSearch_box');
	if(box && box.value)
		w.voidSearch();
})(window,document)

