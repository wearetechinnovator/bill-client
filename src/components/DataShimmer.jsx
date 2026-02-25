const DataShimmer = ({ topBox = false }) => {
  return (
    <div className='shimmer__parent'>
      {
        topBox && (
          <div className="w-full flex justify-between mb-5 gap-8">
            <div className='animate w-full h-[75px] rounded'></div>
            <div className='animate w-full h-[75px] rounded'></div>
            <div className='animate w-full h-[75px] rounded'></div>
          </div>
        )
      }
      <div className='flex flex-col gap-2'>
        {Array.from({ length: 8 }).map((i, _) =>
          <div key={_ + Math.random()} className='animate w-full h-[30px] rounded'></div>)}
      </div>
    </div>
  )
}

export default DataShimmer;
