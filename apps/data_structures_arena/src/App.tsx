import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TreeModule from './pages/TreeModule';
import GraphModule from './pages/GraphModule';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tree" element={<TreeModule />} />
        <Route path="/graph" element={<GraphModule />} />
      </Routes>
    </Router>
  );
}

export default App;
