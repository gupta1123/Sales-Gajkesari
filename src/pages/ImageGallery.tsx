import React, { useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app

interface ImageGalleryProps {
    images: string[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
    const [photoIndex, setPhotoIndex] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                    <div key={index} onClick={() => {
                        setPhotoIndex(index);
                        setIsOpen(true);
                    }}>
                        <img src={image} alt={`Image ${index + 1}`} style={{ width: '100%', cursor: 'pointer' }} />
                    </div>
                ))}
            </div>
            {isOpen && (
                <Lightbox
                    mainSrc={images[photoIndex]}
                    nextSrc={images[(photoIndex + 1) % images.length]}
                    prevSrc={images[(photoIndex + images.length - 1) % images.length]}
                    onCloseRequest={() => setIsOpen(false)}
                    onMovePrevRequest={() =>
                        setPhotoIndex((photoIndex + images.length - 1) % images.length)
                    }
                    onMoveNextRequest={() =>
                        setPhotoIndex((photoIndex + 1) % images.length)
                    }
                />
            )}
        </>
    );
};

export default ImageGallery;