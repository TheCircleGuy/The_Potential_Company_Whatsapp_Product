import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FlowList } from '@/pages/FlowList';
import { FlowEditor } from '@/pages/FlowEditor';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FlowList />} />
        <Route path="/editor/:id" element={<FlowEditor />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
