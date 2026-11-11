import React, { useEffect, useMemo, useState, createContext, useContext } from "react";
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Compass, MapPin, Heart, CalendarDays, LayoutDashboard, Users, LogOut, Search, Plus, Trash2, Edit, Menu, X, Star, Wallet, Clock, Sparkles, ShieldCheck, Globe2, ArrowRight, UserCircle, Filter, Download, Eye, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "./api";

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);
const categories = ["Historical Places","Beaches","Hill Stations","Temples","Waterfalls","Wildlife Sanctuaries","Adventure Tourism","Museums","Parks and Gardens"];
const money = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fallbackImg = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80";
function Notice({message,kind="success",close}) { if(!message)return null; return <div className={`notice ${kind}`} onClick={close}>{message} <X size={15}/></div>; }
function Protected({children,admin=false}) { const {user,loading}=useAuth(); if(loading)return <div className="center pad">Loading your travel space…</div>; if(!user)return <Navigate to="/login" replace/>; if(admin&&user.role!=="admin")return <Navigate to="/app" replace/>; if(!admin&&user.role==="admin")return <Navigate to="/admin" replace/>; return children; }
function Header(){const {user,logout}=useAuth();return <header className="topbar"><Link to="/" className="brand"><span className="brand-icon"><Compass/></span> WanderWise</Link><nav><Link to="/">Home</Link><Link to="/explore">Explore</Link>{user&&user.role==="user"&&<Link to="/app">My travel</Link>}</nav><div className="header-actions">{user?<><span className="hello">Hi, {user.name.split(" ")[0]}</span><button className="btn btn-outline btn-small" onClick={logout}><LogOut size={15}/> Logout</button></>:<><Link className="btn btn-outline btn-small" to="/login">Login</Link><Link className="btn btn-primary btn-small" to="/register">Get started</Link></>}</div></header>}
function DestinationCard({place,onFavourite,favourite=false,onAdd}){return <article className="destination-card"><div className="card-image"><img src={place.image||fallbackImg} onError={e=>e.currentTarget.src=fallbackImg}/><span className="category-pill">{place.category}</span><button className={`heart ${favourite?"active":""}`} title="Save favourite" onClick={()=>onFavourite?.(place)}><Heart size={18} fill={favourite?"currentColor":"none"}/></button></div><div className="card-body"><div className="card-title-row"><h3>{place.name}</h3><span className="rating"><Star size={14} fill="currentColor"/> {Number(place.rating||0).toFixed(1)}</span></div><p className="muted"><MapPin size={14}/> {place.location}</p><p className="card-description">{place.description}</p><div className="card-meta"><span><Clock size={14}/> {place.durationHours||2} hrs</span><span><Wallet size={14}/> {Number(place.entryFee)===0?"Free":money(place.entryFee)}</span></div><div className="card-actions"><Link to={`/place/${place._id}`} className="btn btn-outline btn-small">Explore <ArrowRight size={14}/></Link>{onAdd&&<button className="btn btn-primary btn-small" onClick={()=>onAdd(place)}>Add to trip</button>}</div></div></article>}
function Layout({children,admin=false}){const {user,logout}=useAuth();const [open,setOpen]=useState(false);const links=admin?[["Overview","/admin",LayoutDashboard],["Destinations","/admin/places",Globe2],["Users","/admin/users",Users],["Trips","/admin/trips",CalendarDays],["Categories","/admin/categories",Filter]]:[["Dashboard","/app",LayoutDashboard],["Explore places","/explore",Compass],["Recommendations","/recommendations",Sparkles],["Plan a trip","/plan",Plus],["My trips","/trips",CalendarDays],["Favourites","/favourites",Heart],["Tourism map","/map",MapPin],["Profile","/profile",UserCircle]];return <div className="dashboard-shell"><aside className={`sidebar ${open?"show":""}`}><Link to="/" className="brand side-brand"><span className="brand-icon"><Compass/></span> WanderWise</Link><div className="side-label">{admin?"ADMIN CONSOLE":"TRAVEL SPACE"}</div>{links.map(([label,path,Icon])=><Link key={path} to={path} onClick={()=>setOpen(false)} className={`side-link ${location.pathname===path?"selected":""}`}><Icon size={18}/>{label}</Link>)}<div className="side-bottom"><div className="profile-mini"><div className="avatar">{user?.name?.[0]?.toUpperCase()}</div><div><b>{user?.name}</b><small>{admin?"Administrator":"Traveller"}</small></div></div><button className="side-link logout-link" onClick={logout}><LogOut size={18}/> Sign out</button></div></aside><main className="dashboard-main"><div className="mobile-bar"><button onClick={()=>setOpen(!open)} className="icon-btn">{open?<X/>:<Menu/>}</button><b>WanderWise</b></div>{children}</main></div>}
function PageTitle({eyebrow,title,sub,action}){return <div className="page-title"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{sub&&<p>{sub}</p>}</div>{action}</div>}
function Landing(){const [places,setPlaces]=useState([]);useEffect(()=>{api.get("/places?featured=true").then(r=>setPlaces(r.data.places.slice(0,3))).catch(()=>{});},[]);return <><Header/><section className="hero"><div className="hero-overlay"></div><div className="hero-content"><span className="hero-tag"><Sparkles size={15}/> DISCOVER MORE. TRAVEL BETTER.</span><h1>Your next great story<br/><em>starts somewhere.</em></h1><p>Explore remarkable places, discover experiences picked for you, and turn your travel ideas into unforgettable journeys.</p><div className="hero-buttons"><Link to="/explore" className="btn btn-light">Explore destinations <ArrowRight size={17}/></Link><Link to="/register" className="btn btn-glass">Plan your journey</Link></div><div className="hero-trust"><span><CheckCircle2/> Curated destinations</span><span><CheckCircle2/> Smart recommendations</span></div></div></section><section className="section"><div className="section-heading"><div><div className="eyebrow">FIND YOUR INSPIRATION</div><h2>Places worth the journey</h2><p>From coastal escapes to timeless heritage.</p></div><Link to="/explore" className="text-link">View all destinations <ArrowRight size={16}/></Link></div><div className="destination-grid">{places.map(p=><DestinationCard key={p._id} place={p}/>)}</div>{!places.length&&<div className="empty">Add destinations from the admin dashboard or run the seed command to get started.</div>}</section><section className="feature-strip"><div><Compass/><h3>Explore freely</h3><p>Find destinations by category, location and budget.</p></div><div><Sparkles/><h3>Recommendations that fit</h3><p>Discover places based on your travel preferences.</p></div><div><CalendarDays/><h3>Plan with confidence</h3><p>Build day-wise itineraries and track trip costs.</p></div></section><footer>© {new Date().getFullYear()} WanderWise · Travel thoughtfully.</footer></>}
function AuthPage({register=false}){const {login}=useAuth();const nav=useNavigate();const [form,setForm]=useState({name:"",email:"",password:"",role:"user"});const [err,setErr]=useState("");const [busy,setBusy]=useState(false);const submit=async e=>{e.preventDefault();setBusy(true);setErr("");try{if(register){const r=await api.post("/auth/register",form);localStorage.setItem("st_token",r.data.token);window.location.href="/app";}else{const r=await api.post("/auth/login",form);login(r.data);nav(r.data.user.role==="admin"?"/admin":"/app");}}catch(e){setErr(e.response?.data?.message||"Unable to continue. Check your details and API connection.");}finally{setBusy(false);}};return <div className="auth-screen"><Link to="/" className="brand"><span className="brand-icon"><Compass/></span> WanderWise</Link><form className="auth-card" onSubmit={submit}><div className="eyebrow">{register?"START YOUR JOURNEY":"WELCOME BACK"}</div><h1>{register?"Create your account":"Sign in to explore"}</h1><p className="muted">{register?"Your next adventure is closer than you think.":"Continue planning your next memorable trip."}</p>{register&&<label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name"/></label>}<label>Email address<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com"/></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="At least 8 characters"/></label>{!register&&<label>Sign in as<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="user">Traveller</option><option value="admin">Administrator</option></select></label>}{err&&<div className="error-text">{err}</div>}<button className="btn btn-primary btn-full" disabled={busy}>{busy?"Please wait…":register?"Create account":"Sign in"}</button><p className="auth-switch">{register?"Already registered?":"New to WanderWise?"} <Link to={register?"/login":"/register"}>{register?"Sign in":"Create an account"}</Link></p></form></div>}
function Explore(){const [places,setPlaces]=useState([]),[search,setSearch]=useState(""),[category,setCategory]=useState(""),[sort,setSort]=useState("rating");const [favs,setFavs]=useState([]);const {user}=useAuth();const load=()=>api.get("/places",{params:{search,category}}).then(r=>setPlaces(r.data.places)).catch(()=>{});useEffect(()=>{load();},[search,category]);useEffect(()=>{if(user)api.get("/users/favourites").then(r=>setFavs(r.data.favourites.map(f=>f.place?._id))).catch(()=>{});},[user]);const toggle=async p=>{if(!user)return alert("Please sign in to save favourites");await api.post("/users/favourites",{placeId:p._id});setFavs(v=>v.includes(p._id)?v.filter(x=>x!==p._id):[...v,p._id]);};const ordered=[...places].sort((a,b)=>sort==="rating"?b.rating-a.rating:sort==="fee"?a.entryFee-b.entryFee:a.name.localeCompare(b.name));return <><Header/><section className="section explore-section"><PageTitle eyebrow="THE WORLD IS WAITING" title="Explore destinations" sub="Find the place that speaks to your kind of adventure."/><div className="filter-bar"><div className="searchbox"><Search/><input placeholder="Search places, locations…" value={search} onChange={e=>setSearch(e.target.value)}/></div><select value={category} onChange={e=>setCategory(e.target.value)}><option value="">All categories</option>{categories.map(c=><option key={c}>{c}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value)}><option value="rating">Top rated</option><option value="fee">Lowest entry fee</option><option value="name">Name A–Z</option></select></div><div className="destination-grid">{ordered.map(p=><DestinationCard key={p._id} place={p} favourite={favs.includes(p._id)} onFavourite={toggle}/>)}</div>{!ordered.length&&<div className="empty">No destinations match these filters.</div>}</section></>}
function Dashboard(){const {user}=useAuth();const [places,setPlaces]=useState([]),[trips,setTrips]=useState([]),[recs,setRecs]=useState([]);useEffect(()=>{Promise.all([api.get("/places?featured=true"),api.get("/trips"),api.get("/recommendations")]).then(([p,t,r])=>{setPlaces(p.data.places.slice(0,3));setTrips(t.data.trips);setRecs(r.data.recommendations.slice(0,3));}).catch(()=>{});},[]);return <Layout><div className="content-wrap"><PageTitle eyebrow="YOUR TRAVEL SPACE" title={`Welcome back, ${user?.name?.split(" ")[0]}!`} sub="A little inspiration for wherever you want to go next." action={<Link to="/plan" className="btn btn-primary"><Plus size={16}/> Plan a trip</Link>}/><div className="welcome-banner"><div><span>READY FOR YOUR NEXT ADVENTURE?</span><h2>Collect moments,<br/>not just destinations.</h2><Link to="/explore" className="btn btn-light btn-small">Explore places <ArrowRight size={15}/></Link></div><Globe2 className="banner-icon"/></div><div className="mini-stats"><Stat label="My trips" value={trips.length} icon={CalendarDays}/><Stat label="Saved places" value="—" icon={Heart}/><Stat label="Recommendations" value={recs.length} icon={Sparkles}/></div><div className="section-heading compact"><div><h2>Picked for you</h2><p>Recommendations based on your preferences.</p></div><Link to="/recommendations" className="text-link">See all <ArrowRight size={15}/></Link></div><div className="destination-grid">{recs.map(r=><DestinationCard key={r.place._id} place={r.place}/>)}</div><div className="section-heading compact"><div><h2>Featured destinations</h2><p>Popular places to spark your plans.</p></div><Link to="/explore" className="text-link">Explore all <ArrowRight size={15}/></Link></div><div className="destination-grid">{places.map(p=><DestinationCard key={p._id} place={p}/>)}</div></div></Layout>}
function Stat({label,value,icon:Icon}){return <div className="stat-card"><span className="stat-icon"><Icon/></span><div><strong>{value}</strong><small>{label}</small></div></div>}
function Recommendations(){const [items,setItems]=useState([]),[prefs,setPrefs]=useState({categories:[],interests:[],budget:10000,preferredLocation:"",duration:3});const [msg,setMsg]=useState("");const load=()=>api.get("/recommendations").then(r=>setItems(r.data.recommendations)).catch(e=>setMsg(e.response?.data?.message||"Could not load recommendations"));useEffect(()=>{api.get("/auth/me").then(r=>setPrefs(r.data.user.preferences||prefs));load();},[]);const toggle=c=>setPrefs(p=>({...p,categories:p.categories.includes(c)?p.categories.filter(x=>x!==c):[...p.categories,c]}));const save=async()=>{await api.put("/users/preferences",prefs);load();setMsg("Preferences saved and recommendations refreshed.");};return <Layout><div className="content-wrap"><PageTitle eyebrow="MADE FOR YOUR TRAVEL STYLE" title="Your recommendations" sub="Tune your preferences to get more relevant destination ideas."/><div className="panel preference-panel"><h3><Sparkles/> Personalise your discovery</h3><label>Interests (comma separated)<input value={(prefs.interests||[]).join(", ")} onChange={e=>setPrefs({...prefs,interests:e.target.value.split(",").map(x=>x.trim()).filter(Boolean)})} placeholder="nature, culture, adventure"/></label><label>Preferred location<input value={prefs.preferredLocation||""} onChange={e=>setPrefs({...prefs,preferredLocation:e.target.value})} placeholder="Goa, Tamil Nadu…"/></label><div className="form-grid"><label>Travel budget (₹)<input type="number" min="0" value={prefs.budget||0} onChange={e=>setPrefs({...prefs,budget:Number(e.target.value)})}/></label><label>Duration (days)<input type="number" min="1" max="30" value={prefs.duration||1} onChange={e=>setPrefs({...prefs,duration:Number(e.target.value)})}/></label></div><div className="category-checks">{categories.map(c=><label key={c} className="check-label"><input type="checkbox" checked={(prefs.categories||[]).includes(c)} onChange={()=>toggle(c)}/>{c}</label>)}</div><button className="btn btn-primary" onClick={save}>Save preferences & refresh</button>{msg&&<p className="success-text">{msg}</p>}</div><div className="destination-grid top-gap">{items.map((r,i)=><div key={r.place._id} className="recommend-card"><div className="score-pill">{r.score}% match</div><DestinationCard place={r.place}/><p className="reason"><Sparkles size={14}/> {r.reason}</p></div>)}</div></div></Layout>}
function TripPlanner(){const [places,setPlaces]=useState([]),[selected,setSelected]=useState([]),[form,setForm]=useState({name:"My getaway",startLocation:"",startDate:"",endDate:"",travellers:2,budget:10000});const [msg,setMsg]=useState("");useEffect(()=>{api.get("/places").then(r=>setPlaces(r.data.places));},[]);const toggle=id=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);const save=async e=>{e.preventDefault();try{await api.post("/trips",{...form,placeIds:selected});setMsg("Your trip itinerary has been saved.");setSelected([]);}catch(e){setMsg(e.response?.data?.message||"Unable to save trip.");}};return <Layout><div className="content-wrap"><PageTitle eyebrow="MAKE IT HAPPEN" title="Plan your trip" sub="Choose your dates, set a budget and add places to your itinerary."/><form className="panel" onSubmit={save}><div className="form-grid"><label>Trip name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Starting location<input value={form.startLocation} onChange={e=>setForm({...form,startLocation:e.target.value})} placeholder="e.g. Chennai"/></label><label>Start date<input type="date" required value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})}/></label><label>Return date<input type="date" required min={form.startDate} value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})}/></label><label>Travellers<input type="number" min="1" value={form.travellers} onChange={e=>setForm({...form,travellers:Number(e.target.value)})}/></label><label>Total budget (₹)<input type="number" min="0" value={form.budget} onChange={e=>setForm({...form,budget:Number(e.target.value)})}/></label></div><h3 className="subheading">Select destinations ({selected.length} selected)</h3><div className="select-place-grid">{places.map(p=><label className={`select-place ${selected.includes(p._id)?"picked":""}`} key={p._id}><input type="checkbox" checked={selected.includes(p._id)} onChange={()=>toggle(p._id)}/><img src={p.image||fallbackImg}/><span><b>{p.name}</b><small>{p.location} · {money(p.entryFee)}</small></span></label>)}</div><div className="planner-footer"><span>Estimated entry fees: <b>{money(places.filter(p=>selected.includes(p._id)).reduce((s,p)=>s+p.entryFee*form.travellers,0))}</b></span><button className="btn btn-primary" disabled={!selected.length||!form.startDate||!form.endDate}>Save my itinerary</button></div>{msg&&<p className="success-text">{msg}</p>}</form></div></Layout>}
function Trips(){const [trips,setTrips]=useState([]);const load=()=>api.get("/trips").then(r=>setTrips(r.data.trips));useEffect(()=>{load();},[]);const del=async id=>{if(confirm("Delete this trip?")){await api.delete(`/trips/${id}`);load();}};return <Layout><div className="content-wrap"><PageTitle eyebrow="YOUR JOURNEY, ALL IN ONE PLACE" title="My trips" sub="Review your saved travel plans and day-wise destinations." action={<Link to="/plan" className="btn btn-primary"><Plus/> New trip</Link>}/>{trips.map(t=><div className="trip-card panel" key={t._id}><div className="trip-head"><div><span className="eyebrow">{new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}</span><h3>{t.name}</h3><p className="muted">{t.travellers} travellers · Budget {money(t.budget)} · Entry estimate {money(t.estimatedCost)}</p></div><button className="icon-btn danger" onClick={()=>del(t._id)}><Trash2/></button></div><div className="itinerary-days">{t.days?.map(d=><div key={d.day}><b>Day {d.day}</b><span>{d.places?.map(p=>p.name).join(" · ")||"No places assigned"}</span></div>)}</div></div>)}{!trips.length&&<div className="empty">No trips planned yet. Start creating your first itinerary.</div>}</div></Layout>}
function Favourites(){const [items,setItems]=useState([]);const load=()=>api.get("/users/favourites").then(r=>setItems(r.data.favourites));useEffect(()=>{load();},[]);const remove=async p=>{await api.post("/users/favourites",{placeId:p._id});load();};return <Layout><div className="content-wrap"><PageTitle title="Favourite destinations" sub="The places you have saved for later."/><div className="destination-grid">{items.filter(f=>f.place).map(f=><DestinationCard key={f._id} place={f.place} favourite onFavourite={remove}/>)}</div>{!items.length&&<div className="empty">Your saved destinations will appear here.</div>}</div></Layout>}
function TourismMap(){const [places,setPlaces]=useState([]);useEffect(()=>{api.get("/places").then(r=>setPlaces(r.data.places));},[]);const center=places.length?[places[0].latitude,places[0].longitude]:[15.2,76.5];return <Layout><div className="content-wrap"><PageTitle title="Tourism map" sub="Explore destination locations across Goa and Tamil Nadu."/><div className="map-wrap"><MapContainer center={center} zoom={6} scrollWheelZoom style={{height:"620px",width:"100%"}}><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>{places.map(p=><Marker key={p._id} position={[p.latitude,p.longitude]}><Popup><b>{p.name}</b><br/>{p.location}<br/><Link to={`/place/${p._id}`}>View destination</Link></Popup></Marker>)}</MapContainer></div></div></Layout>}
function PlaceDetails(){const {id}=useLocation().pathname.match(/\/place\/(.+)/)||{};const placeId=window.location.pathname.split("/").pop();const [p,setP]=useState(null),[review,setReview]=useState({rating:5,comment:""});useEffect(()=>{api.get(`/places/${placeId}`).then(r=>setP(r.data.place)).catch(()=>{});},[placeId]);if(!p)return <><Header/><div className="center pad">Loading destination…</div></>;const submit=async e=>{e.preventDefault();await api.post(`/places/${p._id}/reviews`,review);alert("Review submitted");};return <><Header/><div className="detail-page"><img className="detail-cover" src={p.image||fallbackImg}/><div className="detail-content"><div className="eyebrow">{p.category}</div><h1>{p.name}</h1><p className="muted"><MapPin size={16}/> {p.location}, {p.state}</p><p>{p.description}</p><div className="detail-facts"><span><Star/> {p.rating} rating</span><span><Clock/> {p.durationHours} hours</span><span><Wallet/> {money(p.entryFee)}</span><span><CalendarDays/> {p.bestTime}</span></div><h3>Facilities</h3><p>{p.facilities?.join(" · ")||"Information not provided"}</p><Link to="/plan" className="btn btn-primary">Add to a trip</Link><h3 className="top-gap">Leave a review</h3><form onSubmit={submit} className="review-form"><select value={review.rating} onChange={e=>setReview({...review,rating:Number(e.target.value)})}>{[5,4,3,2,1].map(x=><option value={x}>{x} stars</option>)}</select><textarea value={review.comment} onChange={e=>setReview({...review,comment:e.target.value})} placeholder="Share your experience…"/><button className="btn btn-primary">Submit review</button></form></div></div></>}
function Profile(){const {user,refresh}=useAuth();const [form,setForm]=useState({name:user.name,phone:user.phone||""});const [msg,setMsg]=useState("");const save=async e=>{e.preventDefault();await api.put("/users/profile",form);await refresh();setMsg("Profile updated.");};return <Layout><div className="content-wrap"><PageTitle title="Your profile" sub="Keep your traveller information up to date."/><form className="panel profile-form" onSubmit={save}><label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email<input value={user.email} disabled/></label><label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><button className="btn btn-primary">Save profile</button>{msg&&<p className="success-text">{msg}</p>}</form></div></Layout>}

function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/stats")
      .then((r) => setData(r.data))
      .catch((err) => console.error("Dashboard error:", err));
  }, []);

  if (!data) {
    return (
      <Layout admin>
        <div className="center pad">Loading analytics…</div>
      </Layout>
    );
  }

  const { stats, byCategory, recentUsers, popular } = data;

  return (
    <Layout admin>
      <div className="content-wrap">

        <PageTitle
          eyebrow="ADMINISTRATION"
          title="Overview dashboard"
          sub="A live snapshot of your tourism platform."
        />

        <div className="stat-grid">
          <Stat label="Registered users" value={stats.users} icon={Users} />
          <Stat label="Tourism places" value={stats.places} icon={MapPin} />
          <Stat label="Planned trips" value={stats.trips} icon={CalendarDays} />
          <Stat label="Categories" value={stats.categories} icon={Filter} />
        </div>

        <div className="analytics-grid">

          {/* Places by category */}
          <div className="panel">
            <h3>Places by category</h3>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={byCategory}>
                <XAxis dataKey="_id" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#2e8067"
                  radius={[7, 7, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="chart-legend">
              {byCategory.map((x) => (
                <span key={x._id}>
                  {x._id}: {x.count}
                </span>
              ))}
            </div>
          </div>

          {/* Category distribution */}
          <div className="panel">
            <h3>Category distribution</h3>

            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="count"
                  nameKey="_id"
                  outerRadius={95}
                  label
                >
                  {byCategory.map((x, i) => (
                    <Cell
                      key={i}
                      fill={[
                        "#174c3e",
                        "#f28b50",
                        "#79b8a2",
                        "#e2bd75",
                        "#7a94c2",
                        "#9d83b5"
                      ][i % 6]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

        </div>

        <div className="analytics-grid">

          {/* Recent registrations */}
          <div className="panel">
            <h3>Recent registrations</h3>

            {recentUsers.map((u) => (
              <div className="list-row" key={u._id}>
                <div className="avatar">
                  {u.name?.[0]}
                </div>

                <div>
                  <b>{u.name}</b>
                  <small>{u.email}</small>
                </div>

                <small>
                  {new Date(u.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>

          {/* Popular destinations */}
          <div className="panel">
            <h3>Popular destinations</h3>

            {popular.map((p) => (
              <div className="list-row" key={p._id}>
                <img
                  className="tiny-image"
                  src={p.image || fallbackImg}
                  alt={p.name}
                />

                <div>
                  <b>{p.name}</b>
                  <small>{p.location}</small>
                </div>

                <span className="rating">
                  <Star size={13} />
                  {p.rating}
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </Layout>
  );
}

function AdminPlaces(){const [places,setPlaces]=useState([]),[editing,setEditing]=useState(null),[form,setForm]=useState({name:"",location:"",state:"Goa",category:"Beaches",description:"",image:"",latitude:"",longitude:"",durationHours:2,entryFee:0,rating:4,bestTime:"October to March",facilities:"Parking, Restrooms",featured:false});const [msg,setMsg]=useState("");const load=()=>api.get("/places").then(r=>setPlaces(r.data.places));useEffect(()=>{load();},[]);const reset=()=>{setEditing(null);setForm({name:"",location:"",state:"Goa",category:"Beaches",description:"",image:"",latitude:"",longitude:"",durationHours:2,entryFee:0,rating:4,bestTime:"October to March",facilities:"Parking, Restrooms",featured:false});};const save=async e=>{e.preventDefault();const payload={...form,latitude:Number(form.latitude),longitude:Number(form.longitude),durationHours:Number(form.durationHours),entryFee:Number(form.entryFee),rating:Number(form.rating),facilities:form.facilities.split(",").map(x=>x.trim()).filter(Boolean)};try{if(editing)await api.put(`/admin/places/${editing}`,payload);else await api.post("/admin/places",payload);reset();load();setMsg("Destination saved successfully.");}catch(e){setMsg(e.response?.data?.message||"Could not save destination.");}};const edit=p=>{setEditing(p._id);setForm({...p,facilities:(p.facilities||[]).join(", ")});window.scrollTo({top:0,behavior:"smooth"});};const del=async id=>{if(confirm("Delete this destination?")){await api.delete(`/admin/places/${id}`);load();}};return <Layout admin><div className="content-wrap"><PageTitle title="Destination management" sub="Create, update and maintain tourism places."/><form className="panel admin-form" onSubmit={save}><h3>{editing?"Edit destination":"Add destination"}</h3><div className="form-grid"><label>Place name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Location / address<input required value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></label><label>State<input value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(c=><option>{c}</option>)}</select></label><label>Latitude<input required type="number" step="any" value={form.latitude} onChange={e=>setForm({...form,latitude:e.target.value})}/></label><label>Longitude<input required type="number" step="any" value={form.longitude} onChange={e=>setForm({...form,longitude:e.target.value})}/></label><label>Visiting duration (hours)<input type="number" value={form.durationHours} onChange={e=>setForm({...form,durationHours:e.target.value})}/></label><label>Entry fee (₹)<input type="number" value={form.entryFee} onChange={e=>setForm({...form,entryFee:e.target.value})}/></label><label>Rating<input type="number" min="0" max="5" step=".1" value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})}/></label><label>Best time to visit<input value={form.bestTime} onChange={e=>setForm({...form,bestTime:e.target.value})}/></label><label className="wide">Image URL<input value={form.image} onChange={e=>setForm({...form,image:e.target.value})}/></label><label className="wide">Description<textarea required value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="wide">Facilities (comma separated)<input value={form.facilities} onChange={e=>setForm({...form,facilities:e.target.value})}/></label><label className="check-label"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})}/> Featured destination</label></div><div className="button-row"><button className="btn btn-primary">{editing?"Update destination":"Add destination"}</button>{editing&&<button type="button" className="btn btn-outline" onClick={reset}>Cancel edit</button>}</div>{msg&&<p className="success-text">{msg}</p>}</form><div className="panel table-panel"><h3>All destinations ({places.length})</h3><div className="table-scroll"><table><thead><tr><th>Destination</th><th>Location</th><th>Category</th><th>Rating</th><th>Actions</th></tr></thead><tbody>{places.map(p=><tr key={p._id}><td>{p.name}</td><td>{p.location}</td><td>{p.category}</td><td>{p.rating}</td><td><button className="icon-btn" onClick={()=>edit(p)}><Edit size={16}/></button><button className="icon-btn danger" onClick={()=>del(p._id)}><Trash2 size={16}/></button></td></tr>)}</tbody></table></div></div></div></Layout>}
function AdminUsers(){const [users,setUsers]=useState([]),[search,setSearch]=useState("");const load=()=>api.get("/admin/users").then(r=>setUsers(r.data.users));useEffect(()=>{load();},[]);const filtered=users.filter(u=>`${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()));const status=async u=>{await api.patch(`/admin/users/${u._id}`,{active:!u.active});load();};const del=async u=>{if(confirm(`Delete ${u.name} and related records?`)){await api.delete(`/admin/users/${u._id}`);load();}};return <Layout admin><div className="content-wrap"><PageTitle title="User management" sub="Review registrations and manage account access."/><div className="panel table-panel"><div className="table-toolbar"><h3>Registered users ({users.length})</h3><input placeholder="Search users…" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map(u=><tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td><td><span className={`status ${u.active?"on":"off"}`}>{u.active?"Active":"Inactive"}</span></td><td><button className="btn btn-outline btn-small" onClick={()=>status(u)}>{u.active?"Deactivate":"Activate"}</button> <button className="icon-btn danger" onClick={()=>del(u)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div></div></div></Layout>}
function AdminTrips(){const [trips,setTrips]=useState([]);useEffect(()=>{api.get("/trips").then(r=>setTrips(r.data.trips));},[]);return <Layout admin><div className="content-wrap"><PageTitle title="Trip management" sub="Monitor trips planned by travellers."/><div className="panel table-panel"><h3>All planned trips ({trips.length})</h3><div className="table-scroll"><table><thead><tr><th>Trip</th><th>User</th><th>Dates</th><th>Travellers</th><th>Budget</th><th>Destinations</th></tr></thead><tbody>{trips.map(t=><tr key={t._id}><td>{t.name}</td><td>{t.user?.name||"—"}</td><td>{new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}</td><td>{t.travellers}</td><td>{money(t.budget)}</td><td>{t.days?.reduce((n,d)=>n+(d.places?.length||0),0)}</td></tr>)}</tbody></table></div></div></div></Layout>}
function AdminCategories(){const [items,setItems]=useState([]),[name,setName]=useState(""),[msg,setMsg]=useState("");const load=()=>api.get("/categories").then(r=>setItems(r.data.categories));useEffect(()=>{load();},[]);const add=async e=>{e.preventDefault();try{await api.post("/admin/categories",{name});setName("");load();}catch(e){setMsg(e.response?.data?.message||"Could not add category");}};const del=async id=>{if(confirm("Delete category?")){await api.delete(`/admin/categories/${id}`);load();}};return <Layout admin><div className="content-wrap"><PageTitle title="Tourism categories" sub="Organise destinations into searchable categories."/><form className="panel inline-form" onSubmit={add}><input required placeholder="New category name" value={name} onChange={e=>setName(e.target.value)}/><button className="btn btn-primary"><Plus size={16}/> Add category</button></form>{msg&&<p className="error-text">{msg}</p>}<div className="category-list">{items.map(c=><div className="panel category-item" key={c._id}><span>{c.name}</span><button className="icon-btn danger" onClick={()=>del(c._id)}><Trash2/></button></div>)}</div></div></Layout>}
function App(){const [user,setUser]=useState(null),[loading,setLoading]=useState(true);const refresh=async()=>{try{const r=await api.get("/auth/me");setUser(r.data.user);}catch{setUser(null);localStorage.removeItem("st_token");}finally{setLoading(false);}};useEffect(()=>{if(localStorage.getItem("st_token"))refresh();else setLoading(false);},[]);const login=data=>{localStorage.setItem("st_token",data.token);setUser(data.user);};const logout=()=>{localStorage.removeItem("st_token");setUser(null);window.location.href="/";};return <AuthContext.Provider value={{user,loading,login,logout,refresh}}><Routes><Route path="/" element={<Landing/>}/><Route path="/login" element={user?<Navigate to={user.role==="admin"?"/admin":"/app"}/>:<AuthPage/>}/><Route path="/register" element={<AuthPage register/>}/><Route path="/explore" element={<Explore/>}/><Route path="/place/:id" element={<PlaceDetails/>}/><Route path="/app" element={<Protected><Dashboard/></Protected>}/><Route path="/recommendations" element={<Protected><Recommendations/></Protected>}/><Route path="/plan" element={<Protected><TripPlanner/></Protected>}/><Route path="/trips" element={<Protected><Trips/></Protected>}/><Route path="/favourites" element={<Protected><Favourites/></Protected>}/><Route path="/map" element={<Protected><TourismMap/></Protected>}/><Route path="/profile" element={<Protected><Profile/></Protected>}/><Route path="/admin" element={<Protected admin><AdminDashboard/></Protected>}/><Route path="/admin/places" element={<Protected admin><AdminPlaces/></Protected>}/><Route path="/admin/users" element={<Protected admin><AdminUsers/></Protected>}/><Route path="/admin/trips" element={<Protected admin><AdminTrips/></Protected>}/><Route path="/admin/categories" element={<Protected admin><AdminCategories/></Protected>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></AuthContext.Provider>}
export default App;
