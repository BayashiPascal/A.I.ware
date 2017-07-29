/* ============= aiware.c =========== */

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <time.h>
#include <math.h>

// ---------- Global constants and inline ----------------

#define NBPLAYER 2
#define NBHOLEPLAYER 6
#define NBHOLE (NBHOLEPLAYER * NBPLAYER)
#define NBINITSTONEPERHOLE 4
#define NBSTONE (NBHOLE * NBINITSTONEPERHOLE)
#define rnd() (double)(rand())/(float)(RAND_MAX)

// ---------- Data structures ----------------

typedef struct Board Board;
struct Board {
  int _level;
  int _nbStone[NBHOLE];
  Board *_next[NBHOLEPLAYER];
  int _score[NBPLAYER];
  char _end;
};

// ---------- Function declaration ----------------

void BoardInit(Board *board, char **arg);
int BoardGetRandMove(Board *board, int iPlayer);
int BoardGetBestMove(Board *board, int iPlayer);
void BoardFree(Board *board);
void BoardExpand(Board *board, int iPlayer, int depth);
void BoardPlayMove(Board *board, int iHole, int iPlayer);
int BoardSearchBestMove(Board *board, int refPlayer, 
  int iPlayer, float *v);
float BoardValue(Board *board, int iPlayer);
void BoardDisplay(Board *board);

// ---------- Function implementation ----------------

void BoardInit(Board *board, char **arg) {
  // Decode the arguments
  // Level
  board->_level = atoi(arg[1]);
  // Sanitize the level value
  if (board->_level < 0) board->_level = 0;
  if (board->_level > 3) board->_level = 3;
  // Score
  for (int iPlayer = 0; iPlayer < NBPLAYER; ++iPlayer) {
    board->_score[iPlayer] = atoi(arg[2 + iPlayer]);
  }
  // Nb stone in holes
  for (int iHole = 0; iHole < NBHOLE; ++iHole) {
    board->_nbStone[iHole] = atoi(arg[4 + iHole]);
  }
  // Initialize the pointers toward next boards
  for (int iHole = 0; iHole < NBHOLEPLAYER; ++iHole) {
    board->_next[iHole] = NULL;
  }
  // Initialize the flag for end of game
  board->_end = 0;
}

int BoardGetRandMove(Board *board, int iPlayer) {
  // Select randomly a hole and loop until we find one containing
  // at least one stone
  // To ensure no infinite loop put a limit to the number of loop
  int iHole = -1;
  int iLoop = 1000;
  while (iHole == -1 && iLoop > 0) {
    int h = (int)floor(rnd() * ((float)NBHOLEPLAYER - 0.0001));
    if (board->_nbStone[iPlayer * NBHOLEPLAYER + h] > 0) {
      iHole = h;
    }
    --iLoop;
  }
  return iHole;
}

void BoardPlayMove(Board *board, int iHole, int iPlayer) {
  int nbStone = board->_nbStone[iHole];
  // Remove stones from starting hole
  board->_nbStone[iHole] = 0;
  // Distribute stones 
  int jHole = iHole;
  while (nbStone > 0) {
    ++jHole;
    if (jHole == NBHOLE) jHole = 0;
    // Jump over starting hole
    if (jHole == iHole) ++jHole;
    if (jHole == NBHOLE) jHole = 0;
    ++(board->_nbStone[jHole]);
    --nbStone;
  }
  // Check for captured stones
  int iOpp = 1 - iPlayer;
  char flagCaptured = 0;
  while (jHole >= iOpp * NBHOLEPLAYER && 
    jHole < (iOpp + 1) * NBHOLEPLAYER &&
    (board->_nbStone[jHole] == 2 ||
    board->_nbStone[jHole] == 3)) {
    board->_score[iPlayer] += board->_nbStone[jHole];
    board->_nbStone[jHole] = 0;
    flagCaptured = 1;
    --jHole;
  }
  // Check for end conditions
  // First, check that the opponent is not starving
  int nbStoneOpp = 0;
  for (int iHole = 0; iHole < NBHOLEPLAYER; ++iHole) {
    nbStoneOpp += board->_nbStone[iOpp * NBHOLEPLAYER + iHole];
  }
  // If the opponent is starving
  if (nbStoneOpp == 0) {
    if (flagCaptured == 1) {
      // If there has been captured stones, it means the current
      // player has starved the opponent. The current player looses.
      board->_end = 1;
      board->_score[iPlayer] = -100.0;
      board->_score[iOpp] = 100.0;
    } else {
      // If there was no captured stones, it means the opponent
      // starved itself. The current player catches all his own stones.
      board->_end = 1;
      for (int iHole = 0; iHole < NBHOLEPLAYER; ++iHole) {
        board->_score[iPlayer] += 
          board->_nbStone[iPlayer * NBHOLEPLAYER + iHole];
      }
    }
  } else if (board->_score[0] * 2 > NBSTONE || 
    board->_score[1] * 2 > NBSTONE) {
    // If one of the player has captured more than half the stones
    // the game ends.
    board->_end = 1;
  }
}

void BoardDisplay(Board *board) {
  // Display the board (for debug)
  for (int iHole = 0; iHole < NBHOLE; ++iHole) {
    printf("%d ", board->_nbStone[iHole]);
  }
  printf("\n");
}

void BoardExpand(Board *board, int iPlayer, int depth) {
  // Expand the story from this board up to a depth equal
  // to level given in argument or end o fthe game
  if (depth != 0 && board->_end == 0) {
    // For each hole containing stone
    for (int iHole = 0; iHole < NBHOLEPLAYER; ++iHole) {
      if (board->_nbStone[iPlayer * NBHOLEPLAYER + iHole] > 0) {
        // Create a copy of the current board
        Board *nBoard = (Board*)malloc(sizeof(Board));
        if (nBoard != NULL) {
          // Affect the copy of the board to the pointer corresponding
          // to this hole
          board->_next[iHole] = nBoard;
          memcpy(nBoard, board, sizeof(Board));
          for (int iHole = 0; iHole < NBHOLEPLAYER; ++iHole) {
            nBoard->_next[iHole] = NULL;
          }
          // Play the move
          BoardPlayMove(nBoard, iHole + iPlayer * NBHOLEPLAYER, iPlayer);
          // Get the next player
          int nPlayer = iPlayer + 1;
          if (nPlayer == NBPLAYER)
            nPlayer = 0;
          // Expand from the new board for next player
          BoardExpand(nBoard, nPlayer, depth - 1);
        }
      }
    }
  }
}

float BoardValue(Board *board, int iPlayer) {
  // Get the value of the board for player iPlayer
  int iOpp = 1 - iPlayer;
  // Simple evaluation based on score
  float ret = board->_score[iPlayer] - board->_score[iOpp];
  // Add noise to discriminate randomly between equal values move
  ret += rnd() * 0.001;
  return ret;
}

int BoardSearchBestMove(Board *board, int refPlayer, 
  int iPlayer, float *v) {
  // Search for best move using minimax
  int bestMove = -1;
  float bestVal = 0.0;
  int iOpp = 1 - iPlayer;
  char flagLeaf = 1;
  // Search among childs
  for (int iHole = 0; iHole < NBHOLEPLAYER; ++iHole) {
    if (board->_next[iHole] != NULL) {
      flagLeaf = 0;
      float val;
      // Get best move for this child
      int m = BoardSearchBestMove(board->_next[iHole], 
        refPlayer, iOpp, &val);
      // To avoid warning at compilation
      m = m;
      if (bestMove == -1) {
        bestMove = iHole;
        bestVal = val;
      } else {
        // Select best move if its turn of refPlayer, worst move else
        if ((refPlayer == iPlayer && val > bestVal) ||
          (refPlayer != iPlayer && val < bestVal)) {
          bestMove = iHole;
          bestVal = val;
        }
      }
    }
  }
  // If this board is a leaf
  if (flagLeaf == 1) {
    // The value of the board is its own value
    *v = BoardValue(board, refPlayer);
  } else {
    // The value of the board is the best value in its child
    *v = bestVal;
  }
  return bestMove;
}

int BoardGetBestMove(Board *board, int iPlayer) {
  int iHole = -1;
  // Expand the story
  BoardExpand(board, iPlayer, board->_level);
  // Search the best move
  float bestVal;
  iHole = BoardSearchBestMove(board, iPlayer, iPlayer, &bestVal);
  return iHole;
}

void BoardFree(Board *board) {
  // Free memory used by board
  for (int iHole = 0; iHole < NBHOLEPLAYER; ++iHole) {
    if (board->_next[iHole] != NULL) {
      BoardFree(board->_next[iHole]);
      free(board->_next[iHole]);
      board->_next[iHole] = NULL;
    }
  }  
}

// ---------- Main ----------------

int main(int argc, char **argv) {
  // Intialise the random generator
  srandom(time(NULL));
  
  // Check the number of arguments
  if (argc != 16) {
    printf("-1");
  }
  
  // Load the arguments
  Board theBoard;
  BoardInit(&theBoard, argv);
  
  // Get the move
  int iHole = -1;
  if (theBoard._level == 0) {
    iHole = BoardGetRandMove(&theBoard, 0);
  } else {
    iHole = BoardGetBestMove(&theBoard, 0);
  }
  
  // Free the memory
  BoardFree(&theBoard);
  
  // Output the move
  printf("%d", iHole);
  fflush(stdout);
  
  return 0;
}

