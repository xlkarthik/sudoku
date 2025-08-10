// Quick test script to check puzzle generation
import { PuzzleGenerator } from '../../shared/src/engine/puzzle-generator.js';
import { PuzzleVariant, Difficulty, PuzzleSize } from '../../shared/src/types/puzzle.js';

async function testPuzzleGeneration() {
  const generator = new PuzzleGenerator();
  
  console.log('Testing puzzle generation...');
  
  const difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD];
  
  for (const difficulty of difficulties) {
    console.log(`\nGenerating ${difficulty} puzzle:`);
    
    try {
      const puzzle = await generator.generatePuzzle({
        variant: PuzzleVariant.CLASSIC,
        difficulty,
        size: PuzzleSize.CLASSIC_9X9
      });
      
      // Count clues
      let clueCount = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (puzzle.initialState[row][col] !== 0) {
            clueCount++;
          }
        }
      }
      
      console.log(`Clues: ${clueCount}/81`);
      console.log(`Difficulty Score: ${puzzle.difficultyScore}`);
      console.log(`Techniques: ${puzzle.metadata.techniques.join(', ')}`);
      
      // Print first few rows to see the puzzle
      console.log('First 3 rows:');
      for (let row = 0; row < 3; row++) {
        console.log(puzzle.initialState[row].map(cell => cell || '.').join(' '));
      }
      
    } catch (error) {
      console.error(`Failed to generate ${difficulty} puzzle:`, error);
    }
  }
}

// Run the test
testPuzzleGeneration();