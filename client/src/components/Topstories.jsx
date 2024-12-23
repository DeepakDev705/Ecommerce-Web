import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import applelogo from '../Images/apple.png';
import milogo from '../Images/mi.png';
import samsunglogo from '../Images/samsung.avif';
import zaralogo from '../Images/zara.png';
import nikelogo from '../Images/nike.jpg';
import adidaslogo from '../Images/adidas.png';
import zudiologo from '../Images/zudio.png';
import lavalogo from '../Images/lava.jpg';

const StaticDataComponent = () => {
  const topStories = [
    { title: 'MOST SEARCHED FOR ON ECOMMERCE || WEB', description: 'IPhone Ja Plus Sarees CMF by Nothing Phone 1Phone 6 Plus iPhone 16 Pro Phone 10 Pro Max REDMI Note 14 Pre- 50 | Whoop Banit | OPPO Find xa | Fipkart Mures Fiskart Exchange Fipkart Reser | Notting Pocket Bataaomi Infin Note 40 Pro 50 iPhone 15 Nota 40 50 Whane 15 Plus Vivo ProMotorola' },
    { title: 'Global Markets Shift Amidst Economic Changes', description: 'SG MOTOROLA 00250 Nothing Phone REDMI 5AT 112 | Oppo 412 | Muteste 50 Phone Realne Smartphone Apple 50 Phone S PreOne 5g Phones Viva 50 Phones | Oppo 5g Smart Phones Depo f1500po A31 Samsung A71 | Samsung A51 Samsung A31 40 Mobile MileCamsung Mobilephone Oppo Mi Mobile' },
    { title: 'MOBILE EXHANGE OFFERS', description: ' discount on the phone phone that you have been syeing on Exchange your sad mobile for new one after the Flipkart experts calitate the value of your of phone, provided its a working condition without damage te Iphone is applikatile for an exchange offer you will see the Tuy with Exchange colon on the product desorption of the phone, So, be smart, always opt for an suchange wherever possess and conions' },
    { title: 'MOBILE PHONES', description: 'Free ladget thenesis state-of-the-art smarphones, we have o imobile beforebody for ones whether you are loosing for urter fersken, power-packed batteries, blazing fast processors, beautifications high-le beebeenspace we take care of the essens Shep from top brandy Samaung Apple Opps lomi Peakme Vive and Honor se the mod relate namesin the markat What is more, with Flat Dongente Motiles P name fee gain frif the round contres. The ants you to me fo stering at wakove pes 10 antytrosen screens, quud domage to porte differegiitches, and rulacements the Flipkart Completa Mobile Protection covers a comprenanalve conge of post-purchase' }
  ];

  const brands = [
    { name: 'APPLE', logo: applelogo },
    { name: 'MI', logo: milogo },
    { name: 'SAMSUNG', logo: samsunglogo },
    { name: 'ZARA', logo: zaralogo },
    { name: 'NIKE', logo: nikelogo },
    { name: 'ADIDAS', logo: adidaslogo },
    { name: 'ZUDIO', logo: zudiologo },
    { name: 'LAVA', logo: lavalogo }
  ];

  return (
    <div className="container my-5">
      {/* Top Stories Section */}
      <div className="row mb-5">
        <h2 className="col-12 text-center mb-5 mt-5">Top Stories</h2>
        {topStories.map((story, index) => (
          <div className="col-12 col-md-6 col-lg-3 mb-4" key={index}>
            <div className="card h-100 shadow-sm">
              <div className="card-body">
                <h5 className="card-title">{story.title}</h5>
                <p className="card-text">{story.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Brand Data Section */}
      <div className="row">
        <h2 className="col-12 text-center mb-5">Featured Brands</h2>
        {brands.map((brand, index) => (
          <div className="col-6 col-md-3 mb-4" key={index}>
            <div className="card text-center border-0">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="card-img-top mx-auto" 
                style={{ maxHeight: '100px', objectFit: 'contain' }} 
              />
              <div className="card-body">
                <h5 className="card-title">{brand.name}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StaticDataComponent;
