import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";


type CarouselImage = {
  src: string;
  heading: string;
  content: string; // may contain <b>
};

type CarouselProps = {
  images: CarouselImage[];
  options?: EmblaOptionsType;
};

const Carousel: React.FC<CarouselProps> = ({ images, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Carousel Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map(({ src, heading, content }, index) => (
            <motion.div
              key={index}
              className="min-w-full px-6"
              initial={{ opacity: 0.7, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="rounded-xl h-full flex flex-col items-center justify-center text-center gap-4">
                <img src={src} alt={`Slide ${index}`} className="size-50 sm:size-60 md:size-70 object-contain" />
                <h3 className="select-none text-2xl font-semibold text-gray-800">{heading}</h3>
                <p
                  className="select-none text-gray-600 text-sm w-[50%] text-shadow-2xs"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-20 lg:left-40 top-40 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100"
      >
        <ChevronLeftIcon className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-20 lg:right-40 top-40 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100"
      >
        <ChevronRightIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Carousel;
