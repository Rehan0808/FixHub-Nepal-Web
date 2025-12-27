import React from 'react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="w-full bg-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
      
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Welcome To FixhubNepal<br />
              Your Trusted Repair Partner
            </h1>
            
            <p className="text-base text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat voluptatem ipsam eius?Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptas fugiat obcaecati perferendis aut odio dolor.
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <button className="px-6 py-2.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors">
                Read more
              </button>
             
            </div>
          </div>
          
         
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[720px] aspect-[6/5] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
              <Image
                src="/images/login.png"
                alt="Hero image"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}