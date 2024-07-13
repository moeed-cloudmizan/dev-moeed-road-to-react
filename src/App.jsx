import * as React from 'react';
import axios from 'axios';

const title = 'React';
const welcome = {
  greeting: 'Welcome to',
  title: 'Hacker Stories'
};

const useStorageState = (key,initialState)=>{
  const [value, setValue] = React.useState(localStorage.getItem(key)||initialState);
  React.useEffect(()=>{
    localStorage.setItem(key,value);
  },[value,key]);

  return [value, setValue];
};

const InputWithLabel = ({id ,value,type='text', changeHandler,children}) => {
  
  
    console.log({children}+' renders')
    
  return (
    <>
      <label htmlFor={id}>{children} </label>
      <input id={id} type={type} onChange={changeHandler} value={value} />
    </>
  );
}
const storiesReducer=(state,action)=>{
switch(action.type){
  case 'STORIES_FETCH_INIT':
    return {
      ...state,
      isLoading:true,
      error:false,
    };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading:false,
        error:false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading:false,
        error:true,
      };
      case 'REMOVE_STORY':
        return{
          ...state,
          data: state.data.filter(
            (story)=> story.objectID !=  action.payload
          ),
        };
      default:
        throw new Error();
}
}
const SearchForm = ({handleClick,searchHandler,searchTerm}) =>(
  <form onSubmit={handleClick}>
     <InputWithLabel id= "search" isFocused changeHandler={searchHandler}  value={searchTerm} >
    <strong>
    Search:
      </strong>   
    </InputWithLabel>
      <button type='submit'  disabled={!searchTerm} >Submit</button>
      </form>
);


const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';
const App = () =>  {
  console.log('App renders');
  const [searchTerm, setSearchTerm] = useStorageState('search','React');
  const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);
  const [stories,dispatchStories] = React.useReducer(
    storiesReducer,{data: [],isLoading: false,error: false}); 
  const handleFetchingData = React.useCallback(async()=>{
    if(searchTerm=='')
      return;
    dispatchStories({type:  'STORIES_FETCH_INIT'});
    try
    {const result = await axios.get(url);
    
      dispatchStories({type: 'STORIES_FETCH_SUCCESS',payload: result.data.hits });}
      catch{
        dispatchStories({type: 'STORIES_FETCH_FAILURE'});
      }
  },[url]);
  
  React.useEffect(()=>{handleFetchingData();}
  ,[handleFetchingData]);
  const searchHandler = (event) => {
    setSearchTerm(event.target.value);
  };
    const handleClick = (event)=>{
      setUrl(`${API_ENDPOINT}${searchTerm}`);
      event.preventDefault();
    };
  const removeItem = (objectID) =>{
    dispatchStories({
      type: 'REMOVE_STORY',
      payload: objectID,
      });    
  }
 
  return (
    <div>
      <h1>
        Road to {title}
      </h1>
      <h2>
        {welcome.greeting} {welcome.title} 
      </h2>
     <SearchForm handleClick={handleClick} searchHandler={searchHandler} searchTerm={searchTerm} />


      {
        stories.isLoading?(
          <p>
            Loading...
          </p>
        ):
       stories.error?
        (
          <p>
            Error while retreiving data
          </p>
        ):
        (
          <List list={stories.data} remFunc = {removeItem}/>
        )
      }
      
      
    </div>
  );
}
const List = ({list,remFunc}) => {
  console.log('List renders')
  return (
    <ul>
        {list.map((item) => {
        return <Item key={item.objectID} remFunc={remFunc} {...item} > </Item>;
        })}
      </ul>
  );
};

const Item = ({remFunc,title,url,author,num_comments,points,objectID}) => {
  console.log('Item renders');
 
  return (
   <li>
        <span>
          <a href={url}>{title}:</a>
        </span> 
        <span> Author: {author}, 
          </span>
          <span> Num of Comments: {num_comments}, 
            </span>
            <span> Points: {points} </span>
            <button type='button' onClick={()=>remFunc(objectID)} >  Remove </button>
            </li>
        
);};
export default App; 