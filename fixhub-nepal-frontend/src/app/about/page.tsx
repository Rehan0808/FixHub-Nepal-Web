import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Wrench, Users, Award, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">
            About <span className="text-primary">Fixhub Nepal</span>
          </h1>
          <p className="text-gray max-w-2xl mx-auto text-lg">
            Nepal&apos;s leading vehicle repair and maintenance platform, connecting vehicle owners with trusted mechanics since 2024.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-dark mb-6">Our Mission</h2>
              <p className="text-gray leading-relaxed mb-4">
                At Fixhub Nepal, we believe every vehicle deserves professional care. Our mission is to make vehicle maintenance accessible, transparent, and hassle-free for every Nepali vehicle owner.
              </p>
              <p className="text-gray leading-relaxed">
                We connect you with certified mechanics, provide transparent pricing, and ensure your vehicle gets the best service possible — all through our easy-to-use platform.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Wrench, label: "Services", value: "50+" },
                { icon: Users, label: "Customers", value: "5,000+" },
                { icon: Award, label: "Years", value: "2+" },
                { icon: MapPin, label: "Locations", value: "10+" },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-light p-6 rounded-xl text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-2xl font-bold text-dark">{stat.value}</p>
                  <p className="text-sm text-gray">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-dark mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Quality First", desc: "We never compromise on the quality of our services. Only genuine parts and expert workmanship." },
              { title: "Customer Trust", desc: "Transparent pricing, honest assessments, and reliable service that builds lasting relationships." },
              { title: "Innovation", desc: "Leveraging technology to make vehicle maintenance easier and more accessible for everyone." },
            ].map((value, i) => (
              <div key={i} className="bg-white p-8 rounded-xl border border-gray-border">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary">{i + 1}</span>
                </div>
                <h3 className="text-lg font-semibold text-dark mb-2">{value.title}</h3>
                <p className="text-sm text-gray">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
