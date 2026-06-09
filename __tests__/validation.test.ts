import { validateRecipeInput } from '../utils/validation';
import { describe, it, expect } from '@jest/globals';

describe('Recipe Validation Tests', () => {
  
  it('1. should return null for valid, normal inputs', () => {
    expect(validateRecipeInput('Pasta', 'Tomato, Cheese', '15', '20')).toBeNull();
  });

  it('2. should return error if title is empty', () => {
    expect(validateRecipeInput('', 'Tomato, Cheese', '15', '20')).toBe(
      'Recipe title must be between 3 and 50 characters.'
    );
  });

  it('3. should return error if title is too short (less than 3 chars)', () => {
    expect(validateRecipeInput('Ab', 'Tomato, Cheese', '15', '20')).toBe(
      'Recipe title must be between 3 and 50 characters.'
    );
  });

  it('4. should return error if title is too long (more than 50 chars)', () => {
    const longTitle = 'A'.repeat(51); // 51 karakterli sahte başlık
    expect(validateRecipeInput(longTitle, 'Tomato, Cheese', '15', '20')).toBe(
      'Recipe title must be between 3 and 50 characters.'
    );
  });

  it('5. should return error if title contains special characters', () => {
    expect(validateRecipeInput('Pasta@!', 'Tomato, Cheese', '15', '20')).toBe(
      'Recipe title cannot contain special characters.'
    );
  });

  it('6. should return error if ingredients are empty', () => {
    expect(validateRecipeInput('Pasta', '', '15', '20')).toBe(
      'Ingredients list is too short. Please provide more details.'
    );
  });

  it('7. should return error if ingredients are too short (less than 5 chars)', () => {
    expect(validateRecipeInput('Pasta', 'Salt', '15', '20')).toBe(
      'Ingredients list is too short. Please provide more details.'
    );
  });

  it('8. should return error if prep time is text instead of number', () => {
    expect(validateRecipeInput('Pasta', 'Tomato, Cheese', 'abc', '20')).toBe(
      'Prep time must be a valid positive number.'
    );
  });

  it('9. should return error if prep time is a negative number', () => {
    expect(validateRecipeInput('Pasta', 'Tomato, Cheese', '-5', '20')).toBe(
      'Prep time must be a valid positive number.'
    );
  });

  it('10. should return error if cook time is missing or negative', () => {
    expect(validateRecipeInput('Pasta', 'Tomato, Cheese', '15', '-10')).toBe(
      'Cook time must be a valid positive number.'
    );
  });

});