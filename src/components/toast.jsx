export default function Toast({ message, show }) {

if (!show) return null;

return (

<div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">

<div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold">

{message}

</div>

</div>

);

}



