import 'babel-polyfill'
import 'whatwg-fetch'
import yo from 'yo-yo'

const values = function*(obj) {
	for(let key in Object.keys(obj)) 
		yield obj[key]
}

const getJson = url => fetch(url).then( resp => resp.json() )
		
const getMovie = imdbId => getJson(`http://omdbapi.com/?i=${imdbId}&tomatoes=true`)

const searchByTitle = q => 
	getJson(`http://omdbapi.com/?s=${q}`)
		.then( results => 
			Promise.all(
				Array.from(values(results.Search))
					.map( movie => movie.imdbID )
					.map( getMovie )
					.map( promise => promise.catch( err => ({ error: true }) ) )
			)
		)
		.then( movies => movies.filter( m => !m.error ) )

const onSubmit = e => {
	e.preventDefault()
	
	let query = document.getElementById('search').value
	searchByTitle(query)
		.then( results => {
			let dom = document.getElementById('content')
			yo.update(dom, render(results))
		})
}

const render = movies => yo`
	<div id="content">
		<form onsubmit=${onSubmit}>
			<label for="search" hidden>Search</label>
			<input id="search">
			<button type="submit">search</button>
		</form>
		<div class="results">
			${movies.map( movie => yo` 
				<div>
					<h2>${movie.Title}</h2>
					<p>
						Starring ${movie.Actors}<br>
						Directed By ${movie.Director}
					</p>
					<p>${movie.Plot}</p>
					<p>Rotten Tomatoes: <a href="${movie.tomatoURL}">${movie.tomatoMeter}%</a></p>
				</div>
			`)}
		</div>
	</div>`

document.addEventListener('DOMContentLoaded', () => {
	let dom = render([])
	document.body.appendChild(dom) 
})
