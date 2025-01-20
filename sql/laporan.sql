SELECT
    users.id_card,
    users.nama,
    users.nim ,
    t.judul,
    prodi.prodi,
    pt.proposal,
    pt.hasil,
    pt.tutup,
    pt.hasil,
    pt.proposal,
    s.biaya,
    t.tanggal_pembayaran,
    t.nama_bank,
    i.image
FROM users
join turnitin t on users.id = t.users_id
left join prodi on users.prodi_id = prodi.id
left join proses_turnitin pt on t.id = pt.turnitin_id
left join strata s on prodi.kode_strata = s.id
left join images i on users.id = i.users_id
where role_id = 3 and
    month(tanggal_pembayaran) = $1 and year(tanggal_pembayaran) = $2
