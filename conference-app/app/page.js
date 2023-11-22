import Link from "next/link";
import profilePic from './assets/images/image1.png' 
import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-screen w-screen  flex flex-col items-center justify-center pt-20">
     <div className="flex flex-col items-center">
     <h1 className="font-bold text-5xl font-serif  text-white">
        Welcome to Samvad Connect
      </h1>
      <h3 className=" font-bold text-white text-[14px]">Empowering conversations, bridging distances effortlessly</h3>
      </div> 
      <Link href="/lobby">
    
        </Link>

      <Link className="mt-10 flex items-center" href="/lobby">
      <button className="bg-gradient-to-r  text-white text-xl rounded-xl from-[#1E59F0] to-[#b23ab4]  px-8 py-4 flex items-center">
          Get started
          <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 ml-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
          />
        </svg>
        </button>
       
      </Link>
      <div className="group relative mt-10 flex items-center justify-center">
      <Image
      className="object-cover w-full h-full rounded-md"
      src={profilePic}
      alt="Picture of the author" 
      width={500}
      height={500} 
      blurDataURL="data:..."
      placeholder="blur" // Optional blur-up while loading
    />
      <div className=" hidden group-hover:flex absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-xl font-bold">
      Where screens dissolve and conversations evolve.
      </div>
    </div>
  
    </div>
  );
}

{
  /* <button className="bg-[#ff8872] border-2 border-white shadow-md font-bold text-black  px-12 py-6  text-2xl rounded-xl mt-8">Click To Begin</button>  */
}
