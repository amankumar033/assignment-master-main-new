'use client';

import NextTopLoader from 'nextjs-toploader';

const TopLoader = () => {
  return (
    <NextTopLoader
      color="#D27208"
      initialPosition={0.08}
      crawlSpeed={100}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px rgba(210,114,8,0.4),0 0 5px rgba(210,114,8,0.3)"
      template='<div class="bar" role="bar"><div class="peg"></div></div> 
      <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
      zIndex={1600}
      showAtBottom={false}
      stopDelayMs={100}
    />
  );
};

export default TopLoader;
