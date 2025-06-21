// src/context/BlogContext.jsx
import React, { createContext, useContext, useReducer } from 'react';
import { api } from '../utils/api';

const BlogContext = createContext();

const initialState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

function blogReducer(state, action) {
  switch (action.type) {
    case 'FETCH_POSTS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_POSTS_SUCCESS':
      return {
        ...state,
        posts: action.payload.posts,
        pagination: action.payload.pagination,
        loading: false,
      };
    case 'FETCH_POSTS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'FETCH_POST_SUCCESS':
      return { ...state, currentPost: action.payload, loading: false };
    case 'CREATE_POST_SUCCESS':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
        currentPost: action.payload,
        loading: false,
      };
    case 'UPDATE_POST_SUCCESS':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post._id === action.payload._id ? action.payload : post
        ),
        currentPost: action.payload,
        loading: false,
      };
    case 'DELETE_POST_SUCCESS':
      return {
        ...state,
        posts: state.posts.filter((post) => post._id !== action.payload),
        currentPost:
          state.currentPost && state.currentPost._id === action.payload
            ? null
            : state.currentPost,
        loading: false,
      };
    default:
      return state;
  }
}

export const BlogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(blogReducer, initialState);

  const fetchPosts = async (page = 1, limit = 10) => {
    dispatch({ type: 'FETCH_POSTS_REQUEST' });
    try {
      const response = await api.get(`/posts?page=${page}&limit=${limit}`);
      dispatch({
        type: 'FETCH_POSTS_SUCCESS',
        payload: {
          posts: response.data.data.posts,
          pagination: response.data.data.pagination,
        },
      });
    } catch (error) {
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: error.message });
    }
  };

  const fetchPost = async (id) => {
    dispatch({ type: 'FETCH_POSTS_REQUEST' });
    try {
      const response = await api.get(`/posts/${id}`);
      dispatch({ type: 'FETCH_POST_SUCCESS', payload: response.data.data });
    } catch (error) {
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: error.message });
    }
  };

  const createPost = async (postData) => {
    dispatch({ type: 'FETCH_POSTS_REQUEST' });
    try {
      const response = await api.post('/posts', postData);
      dispatch({ type: 'CREATE_POST_SUCCESS', payload: response.data.data });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: error.message });
      throw error;
    }
  };

  const updatePost = async (id, postData) => {
    dispatch({ type: 'FETCH_POSTS_REQUEST' });
    try {
      const response = await api.put(`/posts/${id}`, postData);
      dispatch({ type: 'UPDATE_POST_SUCCESS', payload: response.data.data });
      return response.data.data;
    } catch (error) {
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: error.message });
      throw error;
    }
  };

  const deletePost = async (id) => {
    dispatch({ type: 'FETCH_POSTS_REQUEST' });
    try {
      await api.delete(`/posts/${id}`);
      dispatch({ type: 'DELETE_POST_SUCCESS', payload: id });
    } catch (error) {
      dispatch({ type: 'FETCH_POSTS_FAILURE', payload: error.message });
      throw error;
    }
  };

  return (
    <BlogContext.Provider
      value={{
        ...state,
        fetchPosts,
        fetchPost,
        createPost,
        updatePost,
        deletePost,
      }}
    >
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => useContext(BlogContext);
