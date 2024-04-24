import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

interface ImageGalleryProps {
    images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
    return (
        <Carousel>
            {images.map((image, index) => (
                <div key={index}>
                    <img src={image} alt={`Image ${index + 1}`} />
                </div>
            ))}
        </Carousel>
    );
};

export default ImageGallery;