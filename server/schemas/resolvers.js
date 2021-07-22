const { AuthError } = require('apollo-server-express');
const { User } = require('../models');
const { sToken } = require('../utils/auth');

const resolver = {
    Query: {
      me: async (parent, args, context) => {
        if (context.user) {
          const userData = await User.findOne({ _id: context.user._id }).select('-__v -password');
  
          return userData;
        }
  
        throw new AuthError('Not logged in');
      },
    },
    Mutation: {
        addUser: async (parent, args) => {
          const user = await User.create(args);
          const token = sToken(user);
    
          return { token, user };
        },
        login: async (parent, { email, password }) => {
          const user = await User.findOne({ email });
    
          if (!user) {
            throw new AuthError('you got the wrong credentials :/');
          }
    
          const correctPw = await user.isCorrectPassword(password);
    
          if (!correctPw) {
            throw new AuthError('you got the wrong credentials :/ smh');
          }
    
          const token = sToken(user);
          return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
              const updatedUser = await User.findByIdAndUpdate(
                { _id: context.user._id },
                { $push: { savedBooks: bookData } },
                { new: true }
              );
      
              return updatedUser;
            }
      
            throw new AuthError('Yo you gotta log in fam, what you doin?');
          },
          removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
              const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
              );
              return updatedUser;
            }
            throw new AuthError('Yo you gotta log in fam, what you doin?');
          },
    },
};

module.exports = resolver;