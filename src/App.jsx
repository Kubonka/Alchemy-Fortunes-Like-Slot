import { useState, useRef, useEffect } from "react";
import GameState from "./helperClasses/GameState";
import GameManager from "./base/GameManager";
import Menu from "./Menu";
import UI from "./UI";
function App() {
  const main = useRef();
  const [menu, setMenu] = useState(false);

  //const [massValue, setMassValue] = useState(0);
  //const baseGui = useRef(); //? GUI DISABLED

  const firstMount = useRef(true);
  const initialLoad = useRef(true);
  function handleChangeState(state) {
    main.current.state = state;
  }
  function handleToggleMenu() {
    main.current.toggleMenu();
    setMenu((p) => !p);
  }
  useEffect(() => {
    if (!firstMount.current) {
      main.current = new GameManager();
      //baseGui.current = new BaseGui(); //? GUI DISABLED
    }
    return () => {
      //if (!initialLoad.current) baseGui.current.gui.destroy(); //? GUI DISABLED
      firstMount.current = false;
    };
  }, []);

  return (
    <>
      <div id="pixiContainer" className="absolute"></div>
      {/* <UI /> */}
      {/* <Menu show={menu} changeState={handleChangeState} toggleMenu={handleToggleMenu} /> */}
    </>
  );
}

export default App;
