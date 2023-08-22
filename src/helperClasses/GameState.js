const GameState = Object.freeze({
  Initialize: Symbol("Initialize"),
  NewGame: Symbol("NewGame"),
  Loading: Symbol("Loading"),
  Animating: Symbol("Animating"),
  PlayerTurn: Symbol("PlayerTurn"),
});
export default GameState;
