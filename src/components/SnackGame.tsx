import React, { useState, useEffect, useCallback } from "react";
import {
  type GameState,
  type Position,
  GRID_SIZE,
  CELL_SIZE,
  GAME_SPEED,
} from "../types/game";
import MobileControls from "./MobileControls";

const createFood = (snake: Position[]): Position => {
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (
    snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );
  return newFood;
};

const initialGameState: GameState = {
  snake: [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ],
  food: { x: 5, y: 5 },
  direction: "UP",
  gameOver: false,
  score: 0,
  isPaused: false,
};

const SnakeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [showMobileControls, setShowMobileControls] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;
      setIsMobile(mobile);
      setShowMobileControls(mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setGameState({
      ...initialGameState,
      food: createFood(initialGameState.snake),
    });
  };

  const resetGame = () => {
    setGameState({
      ...initialGameState,
      food: createFood(initialGameState.snake),
    });
    setGameStarted(true);
  };

  const togglePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameState.gameOver || gameState.isPaused) return;

    setGameState((prev) => {
      const newSnake = [...prev.snake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (prev.direction) {
        case "UP":
          head.y -= 1;
          break;
        case "DOWN":
          head.y += 1;
          break;
        case "LEFT":
          head.x -= 1;
          break;
        case "RIGHT":
          head.x += 1;
          break;
      }

      // Check wall collision
      if (
        head.x < 0 ||
        head.x >= GRID_SIZE ||
        head.y < 0 ||
        head.y >= GRID_SIZE
      ) {
        return { ...prev, gameOver: true };
      }

      // Check self collision
      if (
        newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
      ) {
        return { ...prev, gameOver: true };
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === prev.food.x && head.y === prev.food.y) {
        // Snake grows, create new food
        return {
          ...prev,
          snake: newSnake,
          food: createFood(newSnake),
          score: prev.score + 1,
        };
      } else {
        // Remove tail if no food eaten
        newSnake.pop();
        return { ...prev, snake: newSnake };
      }
    });
  }, [gameStarted, gameState.gameOver, gameState.isPaused]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!gameStarted) {
        if (event.key === " ") {
          startGame();
        }
        return;
      }

      if (gameState.gameOver) {
        if (event.key === " ") {
          resetGame();
        }
        return;
      }

      if (event.key === " ") {
        togglePause();
        return;
      }

      setGameState((prev) => {
        if (!gameStarted || prev.isPaused) return prev;

        switch (event.key) {
          case "ArrowUp":
            if (prev.direction !== "DOWN") {
              return { ...prev, direction: "UP" };
            }
            break;
          case "ArrowDown":
            if (prev.direction !== "UP") {
              return { ...prev, direction: "DOWN" };
            }
            break;
          case "ArrowLeft":
            if (prev.direction !== "RIGHT") {
              return { ...prev, direction: "LEFT" };
            }
            break;
          case "ArrowRight":
            if (prev.direction !== "LEFT") {
              return { ...prev, direction: "RIGHT" };
            }
            break;
        }
        return prev;
      });
    },
    [gameStarted, gameState.gameOver]
  );

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const calculateGridSize = () => {
    const maxWidth = isMobile ? window.innerWidth - 40 : 400;
    const calculatedCellSize = Math.floor(maxWidth / GRID_SIZE);
    return Math.min(calculatedCellSize, CELL_SIZE);
  };

  const cellSize = calculateGridSize();
  const gridSizePx = GRID_SIZE * cellSize;

  const renderCell = (x: number, y: number) => {
    const isSnake = gameState.snake.some(
      (segment) => segment.x === x && segment.y === y
    );
    const isFood = gameState.food.x === x && gameState.food.y === y;
    const isHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y;

    let cellClass = "border border-gray-200 transition-colors duration-150";

    if (isHead) {
      cellClass += " bg-green-600";
    } else if (isSnake) {
      cellClass += " bg-green-400";
    } else if (isFood) {
      cellClass += " bg-red-500 rounded-full animate-pulse";
    } else {
      cellClass += " bg-gray-100";
    }

    return (
      <div
        key={`${x}-${y}`}
        className={cellClass}
        style={{
          width: cellSize,
          height: cellSize,
          minWidth: cellSize,
          minHeight: cellSize,
        }}
      />
    );
  };

  const renderGrid = () => {
    if (!gameStarted) {
      return (
        <div
          className="flex items-center justify-center bg-gray-300 border-4 border-gray-400 rounded-lg mx-auto"
          style={{
            width: gridSizePx,
            height: gridSizePx,
          }}
        >
          <div className="text-center p-4">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold text-xl shadow-lg transform hover:scale-105"
            >
              Start Game
            </button>
            <p className="mt-4 text-gray-600 text-sm">
              Press Space bar or tap Start to begin
            </p>
          </div>
        </div>
      );
    }

    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        grid.push(renderCell(x, y));
      }
    }
    return grid;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center safe-area-padding">
      <div className="bg-white rounded-2xl shadow-2xl md:p-8 w-full max-w-md mx-auto">
        <h1 className="text-xl md:text-4xl font-bold text-center text-gray-800 mb-2">
          🐍 Snake Game
        </h1>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-2">
          <div className="text-sm md:text-2xl font-semibold text-gray-700 text-center sm:text-left">
            Score: <span className="text-green-600">{gameState.score}</span>
          </div>
          <div className="md:flex justify-center gap-2 hidden">
            {gameStarted && (
              <>
                <button
                  onClick={togglePause}
                  className="px-3 py-2 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm md:text-base flex-1"
                >
                  {gameState.isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={resetGame}
                  className="px-3 py-2 md:px-4 md:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm md:text-base flex-1"
                >
                  Restart
                </button>
              </>
            )}
          </div>
        </div>

        <div className="relative">
          <div
            className="grid bg-gray-300 border-2 border-gray-400 rounded-lg mx-auto overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
              width: gridSizePx,
              height: gridSizePx,
            }}
          >
            {renderGrid()}
          </div>

          {!gameStarted && (
            <div className="absolute left-2 top-2 w-full inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-center p-4">
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold text-xl shadow-lg transform hover:scale-105 mb-4"
                >
                  Start Game
                </button>
                <p className="text-white text-sm">
                  Use arrow keys to control the snake
                </p>
              </div>
            </div>
          )}
          {gameState.gameOver && (
            <div className="absolute top-1/2 -translate-y-1/2 left-2 w-full mt-4 md:mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
              <h2 className="text-xl md:text-2xl font-bold text-red-600 mb-2">
                Game Over!
              </h2>
              <p className="text-gray-700 mb-4">
                Final Score: {gameState.score}
              </p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg w-full md:w-auto"
              >
                Play Again
              </button>
            </div>
          )}
            {gameState.isPaused && gameStarted && !gameState.gameOver && (
          <div className="mt-4 p-3 py-10 absolute top-1/2 -translate-y-1/2 w-full left-2 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
            <p className="text-yellow-700 font-semibold">Game Paused</p>
          </div>
        )}
        </div>

        {showMobileControls && gameStarted && !gameState.gameOver && (
          <MobileControls
            onDirectionChange={(direction) => {
              if (gameStarted && !gameState.gameOver && !gameState.isPaused) {
                setGameState((prev) => ({ ...prev, direction }));
              }
            }}
          />
        )}

        <div className="mt-2 p-2 bg-gray-100 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2 text-center md:text-left">
            Controls:
          </h3>
          <div className="text-xs md:text-sm text-gray-600 space-y-1 text-center md:text-left">
            <p>🔼🔽◀️▶️ Arrow Keys - Move Snake</p>
            <p>Space - {gameStarted ? "Pause/Resume" : "Start Game"}</p>
            {gameState.gameOver && <p>Space - Restart Game</p>}
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default SnakeGame;
