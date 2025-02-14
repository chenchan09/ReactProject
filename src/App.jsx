

import { useEffect, useState } from "react"
import Search from "./component/Search"
import Spinner from "./component/Spinner"
import MovieCard from "./component/MovieCard";

import context from "./component/context";
import { useDebounce } from "react-use";


//api - application programming interface
const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization:`Bearer ${API_KEY}`
  }
}

// const firebaseDB = async () => {
//   const querySnapshot = await getDoc(collection(db, "test")); // "movies" is your Firestore collection
//   console.log(querySnapshot);
// };

const App = () => {
const [searchTerm, setSearchTerm] = useState('');
const [errorMessage, seterrorMessage] = useState('')
const [movieList, setmovieList] = useState([]);
const [isLoading, setisLoading] = useState(false)
const [debounceSearchTerm, setdebounceSearchTerm] = useState('');
const [trendingMovies, settrendingMovies] = useState([]);

//test_12354

useDebounce(()=> setdebounceSearchTerm(searchTerm), 600, [searchTerm])
  const fetchMovies = async (query = '')=>{
    setisLoading(true);
    try{
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if(!response.ok){
        throw new  Error('Failed to fetch movies')
      }
      const data = await response.json();
      if(data.response === 'False'){
        seterrorMessage(data.Error || 'Failed to fetch movie');
        setmovieList([]);
        return;
      }
      //const _data = await context.get('movies');
      //console.log(_data || []);
      //console.log("Fetched data inside getData():", _data);
      if(searchTerm.length > 0 && data.results.length > 0){
        await context.updateSearchCount('movies',searchTerm, data.results[0]);
      }
      setmovieList(data.results || []);
    }catch(error){
      console.error(`Error fetching movies: ${[]}`);
      seterrorMessage(error)
      
    }finally{
      setisLoading(false);
    }

  }

  const gettrendingMovies = async () => {
    const movies = await context.getTrendingMovie();
    settrendingMovies(movies);
  }

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
    context.getTrendingMovie();
  }, [debounceSearchTerm]);

  useEffect(()=>{
    gettrendingMovies();
  },[]);

  return (
    <main>
      <div className='pattern'></div>
      <div className='wrapper'>
        <header>
          <img src="images/hero.png" alt="Hero Banner"></img>
          <h1 className='text-gradient'>Find <span>Movies</span> You&apos;ll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trendin Movies</h2>

            <ul>
              {
                trendingMovies.map((movie, index)=>
                  (
                    <li key={movie.id}>
                      <p>{index + 1}</p>
                      <img src={movie.posterUrl} alt={movie.ttile} />
                    </li>
                  )
                )
              }
            </ul>
          </section>
        )

        }
        
        <section className="all-movies">
          <h2 className="mt-[20px]">All Movies</h2>
          {isLoading? (
            <Spinner/>
          ): errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ): (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}></MovieCard>
              ))}
            </ul>

          )}
          {errorMessage && <p className="text-red-500">{errorMessage}</p> }
        </section>
      </div>
    </main>
  )
}

export default App