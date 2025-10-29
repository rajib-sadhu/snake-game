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

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setShowMobileControls(isMobile);
  }, []);

  const resetGame = () => {
    setGameState({
      ...initialGameState,
      food: createFood(initialGameState.snake),
    });
  };

  const togglePause = () => {
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const moveSnake = useCallback(() => {
    if (gameState.gameOver || gameState.isPaused) return;

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
  }, [gameState.gameOver, gameState.isPaused]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
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
        if (prev.isPaused) return prev;

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
    [gameState.gameOver, gameState.isPaused]
  );

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const renderCell = (x: number, y: number) => {
    const isSnake = gameState.snake.some(
      (segment) => segment.x === x && segment.y === y
    );
    const isFood = gameState.food.x === x && gameState.food.y === y;
    const isHead = gameState.snake[0]?.x === x && gameState.snake[0]?.y === y;

    let cellClass = "border border-gray-200";

    if (isHead) {
      cellClass += " bg-green-600";
    } else if (isSnake) {
      cellClass += " bg-green-400";
    } else if (isFood) {
      cellClass += " bg-red-500 rounded-full";
    } else {
      cellClass += " bg-gray-100";
    }

    return (
      <div
        key={`${x}-${y}`}
        className={cellClass}
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
        }}
      />
    );
  };

  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        grid.push(renderCell(x, y));
      }
    }
    return grid;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          🐍 Snake Game
        </h1>

        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-semibold text-gray-700">
            Score: <span className="text-green-600">{gameState.score}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={togglePause}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              {gameState.isPaused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Restart
            </button>
          </div>
        </div>

        <div
          className="grid bg-gray-300 border-4 border-gray-400 rounded-lg mx-auto overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {renderGrid()}
        </div>

        {gameState.gameOver && (
          <div className="mt-6 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Game Over!</h2>
            <p className="text-gray-700 mb-4">Final Score: {gameState.score}</p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-lg"
            >
              Play Again
            </button>
          </div>
        )}

        <div className="mt-6 bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Controls:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>🔼🔽◀️▶️ Arrow Keys - Move Snake</p>
            <p>Space - Pause/Resume</p>
            <p>Space (Game Over) - Restart</p>
          </div>
        </div>

        {gameState.isPaused && !gameState.gameOver && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
            <p className="text-yellow-700 font-semibold">Game Paused</p>
          </div>
        )}
        {showMobileControls && (
          <MobileControls
            onDirectionChange={(direction) => {
              if (!gameState.gameOver && !gameState.isPaused) {
                setGameState((prev) => ({ ...prev, direction }));
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default SnakeGame;
