import React from 'react'
import { createContext } from 'react';
import { useState } from 'react';
export const UserContext = createContext();
const UserProvider = ({children}) => {
    const [user,setUser] = useState(null);

    //function to update user
    const updateUser = (userData) =>{
        setUser(userData);
    }

    //function to clear user data
    const clearUser=()=>{
        setUser(null);
    }

    //update user stats 
    const updateUserStats = (key , value) =>{
        setUser((prev)=>({
            ...prev,
            [key]:value,
        }));
    };
    //update totalPollsVotes count locally
    const onUserVoted = () => {
        const totalPollsVoted = user.totalPollsVoted || 0;
        updateUserStats("totalPollsVoted", totalPollsVoted + 1);
    };

    //update totalPollsCreated count locally
    const onPollCreateOrDelete = (type='create') =>{
        const totalPollsCreated = user.totalPollsCreated || 0;
        updateUserStats(
            "totalPollsCreated",
            type == 'create' ? totalPollsCreated + 1 : totalPollsCreated - 1
        );
    }

    //add or remove bookmark id from poll
    const toggleBookmarkId = (id) => {
    const bookmarks = user.bookmarkedPolls || [];
    const index = bookmarks.indexOf(id);

    if (index === -1) {
      //add the id of user if not in the array
      setUser((prev) => ({
        ...prev,
        bookmarkedPolls: [...bookmarks, id],
        totalPollsBookmarked: prev.totalPollsBookmarked + 1,
      }));
    } else {
      //remove the id if already exists
      setUser((prev) => ({
        ...prev,
        bookmarkedPolls: bookmarks.filter((item) => item !== id),
        totalPollsBookmarked: prev.totalPollsBookmarked - 1,
      }));
    }
  };

  return (
    <UserContext.Provider
    value={{
        user,
        updateUser,
        clearUser,
        onPollCreateOrDelete,
        onUserVoted,
        toggleBookmarkId
    }}
    >
        {children}
    </UserContext.Provider>
  )
}

export default UserProvider