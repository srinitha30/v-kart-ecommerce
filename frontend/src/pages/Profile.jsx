import {
  ArrowLeft,
  Check,
  MapPin,
  Phone,
  Save,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import api from "../services/api";


function Profile() {

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });


  // =======================================================
  // LOAD PROFILE
  // =======================================================

  useEffect(() => {

    const loadProfile = async () => {

      try {

        const response =
          await api.get(
            "/user/profile"
          );

        const user =
          response?.data?.user;

        if (!user) {
          throw new Error(
            "User not found"
          );
        }


        const defaultAddress =
          user.addresses?.find(
            (address) =>
              address.isDefault
          ) ||
          user.addresses?.[0];


        setForm({
          name: user.name || "",

          age:
            user.age || "",

          phone:
            user.phone || "",

          addressLine:
            defaultAddress?.addressLine ||
            "",

          city:
            defaultAddress?.city ||
            "",

          state:
            defaultAddress?.state ||
            "",

          pincode:
            defaultAddress?.pincode ||
            "",
        });

      } catch (error) {

        console.error(
          "PROFILE LOAD ERROR:",
          error
        );

        if (
          error?.response?.status === 401
        ) {
          toast.error(
            "Please login first"
          );

          navigate("/login");

          return;
        }

        toast.error(
          "Unable to load profile"
        );

      } finally {

        setLoading(false);

      }
    };


    loadProfile();

  }, [navigate]);


  // =======================================================
  // INPUT CHANGE
  // =======================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setForm((current) => ({
      ...current,
      [name]: value,
    }));

  };


  // =======================================================
  // SAVE PROFILE
  // =======================================================

  const saveProfile = async () => {

    if (!form.name.trim()) {
      toast.error(
        "Enter your name"
      );
      return;
    }


    if (
      form.age &&
      (
        Number(form.age) < 1 ||
        Number(form.age) > 120
      )
    ) {
      toast.error(
        "Enter a valid age"
      );
      return;
    }


    if (
      form.phone &&
      !/^[0-9]{10}$/.test(
        form.phone
      )
    ) {
      toast.error(
        "Enter a valid 10 digit phone"
      );
      return;
    }


    if (
      form.pincode &&
      !/^[0-9]{6}$/.test(
        form.pincode
      )
    ) {
      toast.error(
        "Enter a valid pincode"
      );
      return;
    }


    setSaving(true);


    try {

      const response =
        await api.put(
          "/user/profile",
          form
        );


      if (response?.data?.user) {

        const user =
          response.data.user;

        localStorage.setItem(
          "vkart-user",
          JSON.stringify(user)
        );
      }


      toast.success(
        "Profile updated successfully"
      );

    } catch (error) {

      console.error(
        "PROFILE UPDATE ERROR:",
        error
      );

      if (
        error?.response?.status === 401
      ) {

        toast.error(
          "Please login again"
        );

        navigate("/login");

        return;
      }


      toast.error(
        error?.response?.data?.message ||
        "Unable to update profile"
      );

    } finally {

      setSaving(false);

    }
  };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (
      <main className="min-h-screen bg-[#f6f6f3] px-5 py-10">

        <div className="mx-auto max-w-[800px] animate-pulse">

          <div className="h-5 w-32 rounded bg-black/10" />

          <div className="mt-8 h-10 w-64 rounded bg-black/10" />

          <div className="mt-8 h-[500px] rounded-[28px] bg-white" />

        </div>

      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#171717]">

      <section className="mx-auto max-w-[800px] px-5 py-8">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/45 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />

          Back
        </Link>


        <div className="mt-8">

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            MY ACCOUNT
          </p>

          <h1 className="mt-2 text-4xl font-extrabold">
            Personal details
          </h1>

          <p className="mt-3 text-sm text-black/45">
            Manage your personal and delivery
            information.
          </p>

        </div>


        {/* =================================================
            PROFILE CARD
        ================================================= */}

        <div className="mt-8 rounded-[28px] bg-white p-6 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:p-8">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <User size={24} />
            </div>

            <div>

              <h2 className="text-xl font-extrabold">
                Account information
              </h2>

              <p className="mt-1 text-xs text-black/40">
                Update your personal details.
              </p>

            </div>

          </div>


          <div className="mt-8 grid gap-5 sm:grid-cols-2">


            {/* NAME */}

            <div>

              <label className="mb-2 block text-xs font-bold">
                Name
              </label>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

            </div>


            {/* AGE */}

            <div>

              <label className="mb-2 block text-xs font-bold">
                Age
              </label>

              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Your age"
                className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

            </div>


            {/* PHONE */}

            <div className="sm:col-span-2">

              <label className="mb-2 block text-xs font-bold">
                Phone
              </label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={(event) => {

                  const value =
                    event.target.value
                      .replace(/\D/g, "");

                  setForm((current) => ({
                    ...current,
                    phone:
                      value.slice(0, 10),
                  }));

                }}
                placeholder="10 digit phone number"
                className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

            </div>

          </div>


          {/* =================================================
              ADDRESS
          ================================================= */}

          <div className="mt-10 border-t border-black/[0.06] pt-8">

            <div className="flex items-center gap-3">

              <MapPin
                size={20}
                className="text-indigo-600"
              />

              <h2 className="text-xl font-extrabold">
                Delivery address
              </h2>

            </div>


            <div className="mt-6 space-y-5">


              <div>

                <label className="mb-2 block text-xs font-bold">
                  Address
                </label>

                <textarea
                  name="addressLine"
                  value={form.addressLine}
                  onChange={handleChange}
                  rows={4}
                  placeholder="House / Flat number, street, area"
                  className="w-full resize-none rounded-xl border border-black/[0.08] bg-[#fafaf8] p-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>


              <div className="grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-bold">
                    City
                  </label>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Chennai"
                    className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>


                <div>

                  <label className="mb-2 block text-xs font-bold">
                    State
                  </label>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Tamil Nadu"
                    className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>

              </div>


              <div>

                <label className="mb-2 block text-xs font-bold">
                  Pincode
                </label>

                <input
                  name="pincode"
                  value={form.pincode}
                  onChange={(event) => {

                    const value =
                      event.target.value
                        .replace(/\D/g, "");

                    setForm((current) => ({
                      ...current,
                      pincode:
                        value.slice(0, 6),
                    }));

                  }}
                  placeholder="600001"
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />

              </div>

            </div>

          </div>


          {/* SAVE */}

          <button
            type="button"
            onClick={saveProfile}
            disabled={saving}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-4 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-50"
          >

            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                Saving...
              </>
            ) : (
              <>
                <Save size={18} />

                Save Changes
              </>
            )}

          </button>

        </div>

      </section>

    </main>
  );
}


export default Profile;