
const Search = (prop) => {
  return (
    <div className="search">
        <div >
            <img src="images/search.svg" alt="search" />
            <input type="text" placeholder="Search through thousands of movies" 
            value={prop.searchTerm}
            onChange={(e)=> prop.setSearchTerm(e.target.value)}
            />
        </div>
    </div>
  )
}


export default Search