import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './Components/Header';
import Home from './Components/Home';
import Footer from './Components/Footer';
import ProductsList from './Components/ProductsList';
import BillList from './Components/BillList';
import SuppliersList from './Components/SuppliersList';
import CustomersList from './Components/CustomersList';
import SupplyProductsList from './Components/SupplyProductsList';
import AddProduct from './Components/AddProduct';
import Admin from './Components/Admin';

function App() {

  return (
      <BrowserRouter>
        <Header />

        <div>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/ProductsList" element={<ProductsList />} />
            <Route path="/BillList" element={<BillList />} />
            <Route path="/SuppliersList" element={<SuppliersList />} />
            <Route path="/CustomersList" element={<CustomersList />} />
            <Route path="/Suppliy_Product_List" element={<SupplyProductsList />} />
            <Route path="/AddProduct" element={<AddProduct />} />
            <Route path='/Admin' element={<Admin />} />
          </Routes>
        </div>

        <Footer />
      </BrowserRouter>
  );
}

export default App;
