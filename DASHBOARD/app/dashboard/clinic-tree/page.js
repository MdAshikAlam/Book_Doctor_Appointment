"use client"

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  GitBranch, 
  Search, 
  Loader2, 
  ChevronRight, 
  ChevronDown, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  Calendar,
  Layers,
  ChevronDownSquare,
  ChevronUpSquare
} from 'lucide-react';
import { clinicsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/common/Button';

export default function ClinicTreePage() {
  const { user: currentUser } = useAuth();
  const [treeData, setTreeData] = useState([]);
  const [unassignedClinics, setUnassignedClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Keep track of expanded nodes
  // For admins, key: admin_id
  // For clinics, key: clinic_id
  const [expandedNodes, setExpandedNodes] = useState({});

  const fetchTreeData = async () => {
    try {
      setLoading(true);
      const res = await clinicsApi.getHierarchyTree();
      if (res.status === 'success') {
        setTreeData(res.data.tree || []);
        setUnassignedClinics(res.data.unassignedClinics || []);
        
        // Auto-expand all root nodes by default
        const initialExpanded = {};
        res.data.tree?.forEach(node => {
          initialExpanded[`admin_${node.admin._id}`] = true;
          node.clinics?.forEach(clinic => {
            initialExpanded[`clinic_${clinic._id}`] = true;
          });
        });
        setExpandedNodes(initialExpanded);
      }
    } catch (err) {
      console.error('Failed to fetch clinic tree data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchTreeData();
    }
  }, [currentUser]);

  const toggleNode = (key) => {
    setExpandedNodes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAll = () => {
    const newExpanded = {};
    treeData.forEach(node => {
      newExpanded[`admin_${node.admin._id}`] = true;
      node.clinics?.forEach(clinic => {
        newExpanded[`clinic_${clinic._id}`] = true;
      });
    });
    unassignedClinics.forEach(clinic => {
      newExpanded[`clinic_${clinic._id}`] = true;
    });
    setExpandedNodes(newExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Access Denied</h1>
        <p className="text-slate-500 mt-2 font-medium">Only Super Admins can view the Clinic Hierarchy Tree.</p>
      </div>
    );
  }

  // Calculate high-level counters
  let totalAdmins = treeData.length;
  let totalClinics = unassignedClinics.length;
  let totalDoctors = 0;
  let totalReceptionists = 0;

  treeData.forEach(node => {
    totalClinics += node.clinics?.length || 0;
    node.clinics?.forEach(clinic => {
      totalDoctors += clinic.doctors?.length || 0;
      totalReceptionists += clinic.receptionists?.length || 0;
    });
  });

  unassignedClinics.forEach(clinic => {
    totalDoctors += clinic.doctors?.length || 0;
    totalReceptionists += clinic.receptionists?.length || 0;
  });

  // Filter tree based on search term
  const getFilteredTree = () => {
    if (!searchTerm.trim()) {
      return { filteredTree: treeData, filteredUnassigned: unassignedClinics };
    }

    const term = searchTerm.toLowerCase();

    const filteredTree = treeData.map(node => {
      const adminMatches = node.admin.name.toLowerCase().includes(term) || node.admin.email.toLowerCase().includes(term);

      const matchedClinics = (node.clinics || []).filter(clinic => {
        const clinicMatches = clinic.clinicName.toLowerCase().includes(term) || (clinic.city || '').toLowerCase().includes(term);
        const hasMatchedDoctor = (clinic.doctors || []).some(doc => doc.name.toLowerCase().includes(term) || (doc.specialty || '').toLowerCase().includes(term));
        const hasMatchedReceptionist = (clinic.receptionists || []).some(recep => recep.name.toLowerCase().includes(term));

        return clinicMatches || hasMatchedDoctor || hasMatchedReceptionist;
      });

      if (adminMatches || matchedClinics.length > 0) {
        return {
          ...node,
          clinics: matchedClinics
        };
      }
      return null;
    }).filter(Boolean);

    const filteredUnassigned = unassignedClinics.filter(clinic => {
      const clinicMatches = clinic.clinicName.toLowerCase().includes(term) || (clinic.city || '').toLowerCase().includes(term);
      const hasMatchedDoctor = (clinic.doctors || []).some(doc => doc.name.toLowerCase().includes(term) || (doc.specialty || '').toLowerCase().includes(term));
      const hasMatchedReceptionist = (clinic.receptionists || []).some(recep => recep.name.toLowerCase().includes(term));

      return clinicMatches || hasMatchedDoctor || hasMatchedReceptionist;
    });

    return { filteredTree, filteredUnassigned };
  };

  const { filteredTree, filteredUnassigned } = getFilteredTree();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <GitBranch className="text-blue-600" /> Clinic Hierarchy Tree
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Visual hierarchical view of clinic admins, clinics, and their medical/reception staff.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
            <User size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinic Admins</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalAdmins}</p>
          </div>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinics</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalClinics}</p>
          </div>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
            <Stethoscope size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doctors</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalDoctors}</p>
          </div>
        </div>
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receptionists</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalReceptionists}</p>
          </div>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group flex-1 w-full max-w-lg">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search admins, clinics, doctors, receptionists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-600 transition-all outline-none font-medium text-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={expandAll} className="flex items-center gap-1.5 h-11 px-4 text-xs font-bold rounded-xl border-slate-200">
            <ChevronDownSquare size={16} /> Expand All
          </Button>
          <Button variant="outline" onClick={collapseAll} className="flex items-center gap-1.5 h-11 px-4 text-xs font-bold rounded-xl border-slate-200">
            <ChevronUpSquare size={16} /> Collapse All
          </Button>
        </div>
      </div>

      {/* Tree Data Display */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 md:p-8 shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={40} className="animate-spin text-blue-600 mx-auto" />
            <p className="text-slate-400 mt-4 font-bold">Loading hierarchy layout...</p>
          </div>
        ) : filteredTree.length === 0 && filteredUnassigned.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold">No admins or clinics match your search query.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render Admins list */}
            {filteredTree.map(node => {
              const adminKey = `admin_${node.admin._id}`;
              const isExpanded = !!expandedNodes[adminKey];
              
              return (
                <div key={node.admin._id} className="border border-slate-100/80 rounded-2xl overflow-hidden shadow-xs">
                  {/* Admin Header Node */}
                  <div 
                    onClick={() => toggleNode(adminKey)}
                    className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                        {node.admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-800">{node.admin.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">Tenant Admin</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                            node.admin.status === 'suspended' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>{node.admin.status}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">{node.admin.email} • {node.admin.phone || 'No phone'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {node.clinics?.length || 0} Clinics Open
                      </span>
                    </div>
                  </div>

                  {/* Clinics under Admin */}
                  {isExpanded && (
                    <div className="p-4 bg-white space-y-4 pl-10 border-l-2 border-slate-100 ml-8">
                      {node.clinics.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No clinics registered under this admin yet.</p>
                      ) : (
                        node.clinics.map(clinic => {
                          const clinicKey = `clinic_${clinic._id}`;
                          const isClinicExpanded = !!expandedNodes[clinicKey];

                          return (
                            <div key={clinic._id} className="border border-slate-100/50 rounded-xl overflow-hidden">
                              {/* Clinic Header */}
                              <div 
                                onClick={() => toggleNode(clinicKey)}
                                className="flex items-center justify-between p-3 bg-indigo-50/20 hover:bg-indigo-50/40 transition-colors cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-3">
                                  {isClinicExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                                    <Building2 size={16} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-slate-800">{clinic.clinicName}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                                        clinic.clinicStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-amber-50 text-amber-600 border-amber-150'
                                      }`}>{clinic.clinicStatus}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-medium">{clinic.address}, {clinic.city}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    {clinic.doctors?.length || 0} Doctors
                                  </span>
                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                    {clinic.receptionists?.length || 0} Receptionists
                                  </span>
                                </div>
                              </div>

                              {/* Staff list inside Clinic */}
                              {isClinicExpanded && (
                                <div className="p-3 bg-white space-y-3 pl-8 border-l border-indigo-100 ml-6">
                                  {/* Doctors list */}
                                  <div>
                                    <p className="text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1">Medical Professionals ({clinic.doctors?.length || 0})</p>
                                    {clinic.doctors.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 italic">No doctors assigned.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {clinic.doctors.map(doc => (
                                          <div key={doc._id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                                              {doc.avatar ? <img src={doc.avatar} alt="" className="w-full h-full object-cover" /> : doc.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                              <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                                              <p className="text-[8px] text-slate-400 truncate">{doc.specialty} • {doc.email}</p>
                                            </div>
                                            <span className="ml-auto px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[8px] font-black border border-emerald-100">{doc.status}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Receptionists list */}
                                  <div>
                                    <p className="text-[9px] font-black text-slate-450 uppercase tracking-wider mb-1">Reception Assistants ({clinic.receptionists?.length || 0})</p>
                                    {clinic.receptionists.length === 0 ? (
                                      <p className="text-[10px] text-slate-400 italic">No receptionists assigned.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {clinic.receptionists.map(recep => (
                                          <div key={recep._id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs font-bold">
                                              {recep.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                              <p className="text-xs font-bold text-slate-800 truncate">{recep.name}</p>
                                              <p className="text-[8px] text-slate-400 truncate">{recep.email}</p>
                                            </div>
                                            <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] font-black border ${
                                              recep.status === 'suspended' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>{recep.status}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render Unassigned Clinics */}
            {filteredUnassigned.length > 0 && (
              <div className="border border-dashed border-slate-200 rounded-2xl overflow-hidden mt-8">
                <div className="p-4 bg-slate-100/50 border-b border-slate-200 flex items-center gap-3">
                  <Building2 className="text-slate-500" />
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-700">Unassigned Clinics</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Clinics that are not linked to any active admin account.</p>
                  </div>
                </div>
                
                <div className="p-4 bg-white space-y-4 pl-10">
                  {filteredUnassigned.map(clinic => {
                    const clinicKey = `clinic_${clinic._id}`;
                    const isClinicExpanded = !!expandedNodes[clinicKey];

                    return (
                      <div key={clinic._id} className="border border-slate-150 rounded-xl overflow-hidden">
                        <div 
                          onClick={() => toggleNode(clinicKey)}
                          className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            {isClinicExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
                              <Building2 size={16} />
                            </div>
                            <div>
                              <span className="font-bold text-xs text-slate-700">{clinic.clinicName}</span>
                              <p className="text-[9px] text-slate-400 font-medium">{clinic.address}, {clinic.city}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {clinic.doctors?.length || 0} Doctors
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {clinic.receptionists?.length || 0} Receptionists
                            </span>
                          </div>
                        </div>

                        {isClinicExpanded && (
                          <div className="p-3 bg-white space-y-3 pl-8 border-l border-slate-200 ml-6">
                            {/* Doctors */}
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Doctors ({clinic.doctors?.length || 0})</p>
                              {clinic.doctors.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic">No doctors assigned.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {clinic.doctors.map(doc => (
                                    <div key={doc._id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                                        {doc.avatar ? <img src={doc.avatar} alt="" className="w-full h-full object-cover" /> : doc.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-700">{doc.name}</p>
                                        <p className="text-[8px] text-slate-400">{doc.specialty}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Receptionists */}
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Receptionists ({clinic.receptionists?.length || 0})</p>
                              {clinic.receptionists.length === 0 ? (
                                <p className="text-[10px] text-slate-400 italic">No receptionists assigned.</p>
                              ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {clinic.receptionists.map(recep => (
                                    <div key={recep._id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50/50 border border-slate-100">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                        {recep.name.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-slate-700">{recep.name}</p>
                                        <p className="text-[8px] text-slate-400">{recep.email}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
