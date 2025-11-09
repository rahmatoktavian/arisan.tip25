contract ArisanSetoran {
    struct Setoran {
        uint256 id;              // auto-increment id internal
        string periode_id;       // uuid
        string periode_nama;     // text
        string peserta_id;       // uuid
        string peserta_nama;     // text
        uint256 amountScaled;    // nominal_setor dalam "sen" (x100)
        uint32 tanggalYMD;       // yyyymmdd
        bool deleted;            // soft delete
    }

    uint256 private _nextId = 1;
    mapping(uint256 => Setoran) private _byId;
    uint256[] private _allIds;

    // index sederhana
    mapping(string => uint256[]) private _idsByPeserta; // peserta_id -> list id
    mapping(string => uint256[]) private _idsByPeriode; // periode_id -> list id

    event SetoranAdded(
        uint256 indexed id,
        string periode_id,
        string peserta_id,
        uint256 amountScaled,
        uint32 tanggalYMD
    );

    event SetoranUpdated(
        uint256 indexed id,
        string periode_id,
        string peserta_id,
        uint256 amountScaled,
        uint32 tanggalYMD
    );

    event SetoranDeleted(uint256 indexed id);

    // Tambah record setoran
    function addSetoran(
        string calldata periode_id,
        string calldata periode_nama,
        string calldata peserta_id,
        string calldata peserta_nama,
        uint256 amountScaled,   // contoh 123.45 → kirim 12345
        uint32 tanggalYMD       // contoh 2025-10-29 → 20251029
    ) external returns (uint256) {
        require(bytes(periode_id).length > 0, "periode_id required");
        require(bytes(peserta_id).length > 0, "peserta_id required");
        require(amountScaled > 0, "amount must be > 0");
        require(tanggalYMD >= 19000101 && tanggalYMD <= 29991231, "invalid date");

        uint256 id = _nextId++;
        _byId[id] = Setoran({
            id: id,
            periode_id: periode_id,
            periode_nama: periode_nama,
            peserta_id: peserta_id,
            peserta_nama: peserta_nama,
            amountScaled: amountScaled,
            tanggalYMD: tanggalYMD,
            deleted: false
        });

        _allIds.push(id);
        _idsByPeserta[peserta_id].push(id);
        _idsByPeriode[periode_id].push(id);

        emit SetoranAdded(id, periode_id, peserta_id, amountScaled, tanggalYMD);
        return id;
    }

    // Update record (tidak ubah index historikal untuk sederhana)
    function updateSetoran(
        uint256 id,
        string calldata periode_id,
        string calldata periode_nama,
        string calldata peserta_id,
        string calldata peserta_nama,
        uint256 amountScaled,
        uint32 tanggalYMD
    ) external {
        Setoran storage s = _byId[id];
        require(s.id != 0 && !s.deleted, "not found");
        require(amountScaled > 0, "amount must be > 0");
        require(tanggalYMD >= 19000101 && tanggalYMD <= 29991231, "invalid date");

        s.periode_id = periode_id;
        s.periode_nama = periode_nama;
        s.peserta_id = peserta_id;
        s.peserta_nama = peserta_nama;
        s.amountScaled = amountScaled;
        s.tanggalYMD = tanggalYMD;

        emit SetoranUpdated(id, periode_id, peserta_id, amountScaled, tanggalYMD);
    }

    // Soft delete
    function deleteSetoran(uint256 id) external {
        Setoran storage s = _byId[id];
        require(s.id != 0 && !s.deleted, "not found");
        s.deleted = true;
        emit SetoranDeleted(id);
    }

    // Baca satu record
    function getSetoran(uint256 id) external view returns (Setoran memory) {
        Setoran memory s = _byId[id];
        require(s.id != 0 && !s.deleted, "not found");
        return s;
    }

    // Jumlah total id tercatat (termasuk yang deleted untuk jejak)
    function totalCount() external view returns (uint256) {
        return _allIds.length;
    }

    // Ambil daftar id berdasarkan peserta_id
    function getIdsByPeserta(string calldata peserta_id) external view returns (uint256[] memory) {
        return _idsByPeserta[peserta_id];
    }

    // Ambil daftar id berdasarkan periode_id
    function getIdsByPeriode(string calldata periode_id) external view returns (uint256[] memory) {
        return _idsByPeriode[periode_id];
    }
}
