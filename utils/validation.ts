// utils/validation.ts

export const validateRecipeInput = (title: string, ingredients: string, prepTime: string, cookTime: string) => {

  if (!title || title.trim().length < 3 || title.trim().length > 50) {
    return "Recipe title must be between 3 and 50 characters.";
  }
  
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|<>\/?]+/;
  if (specialCharRegex.test(title)) {
    return "Recipe title cannot contain special characters.";
  }


  if (!ingredients || ingredients.trim().length < 5) {
    return "Ingredients list is too short. Please provide more details.";
  }


  const prep = Number(prepTime);
  const cook = Number(cookTime);

  if (!prepTime || isNaN(prep) || prep < 0) {
    return "Prep time must be a valid positive number.";
  }

  if (!cookTime || isNaN(cook) || cook < 0) {
    return "Cook time must be a valid positive number.";
  }

  return null;
};