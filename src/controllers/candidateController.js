const BlockchainService = require('../services/blockchainService');
const ResponseFormatter = require('../utils/responseFormatter');

class CandidateController {
  /**
   * Get all candidates
   */
  static async getAllCandidates(req, res, next) {
    try {
      console.log('📋 Fetching all candidates...');

      const candidates = await BlockchainService.getAllCandidates();

      console.log(`✅ Found ${candidates.length} candidates`);

      return ResponseFormatter.success(res, candidates, 'Candidates retrieved successfully');
    } catch (error) {
      console.error('Get candidates error:', error);
      next(error);
    }
  }

  /**
   * Get candidates by prodi
   */
  static async getCandidatesByProdi(req, res, next) {
    try {
      const { prodi } = req.params;

      if (!prodi) {
        return ResponseFormatter.validationError(res, {
          prodi: 'Prodi parameter is required',
        });
      }

      console.log('📋 Fetching candidates for prodi:', prodi);

      const candidates = await BlockchainService.getCandidatesByProdi(prodi);

      console.log(`✅ Found ${candidates.length} candidates for ${prodi}`);

      return ResponseFormatter.success(res, candidates, `Candidates for ${prodi} retrieved successfully`);
    } catch (error) {
      console.error('Get candidates by prodi error:', error);
      next(error);
    }
  }

  /**
   * Get voting results (same as get all candidates with vote counts)
   */
  static async getResults(req, res, next) {
    try {
      console.log('📊 Fetching voting results...');

      const candidates = await BlockchainService.getAllCandidates();

      // Sort by vote count (descending)
      const results = candidates.sort((a, b) => parseInt(b.voteCount) - parseInt(a.voteCount));

      console.log(`✅ Results retrieved for ${results.length} candidates`);

      return ResponseFormatter.success(res, results, 'Voting results retrieved successfully');
    } catch (error) {
      console.error('Get results error:', error);
      next(error);
    }
  }

  /**
   * Get results by prodi
   */
  static async getResultsByProdi(req, res, next) {
    try {
      const { prodi } = req.params;

      if (!prodi) {
        return ResponseFormatter.validationError(res, {
          prodi: 'Prodi parameter is required',
        });
      }

      console.log('📊 Fetching results for prodi:', prodi);

      const candidates = await BlockchainService.getCandidatesByProdi(prodi);

      // Sort by vote count (descending)
      const results = candidates.sort((a, b) => parseInt(b.voteCount) - parseInt(a.voteCount));

      console.log(`✅ Results retrieved for ${results.length} candidates in ${prodi}`);

      return ResponseFormatter.success(res, results, `Results for ${prodi} retrieved successfully`);
    } catch (error) {
      console.error('Get results by prodi error:', error);
      next(error);
    }
  }

  /**
   * Get candidates deetail
   */
  static async getCandidatesDetail(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return ResponseFormatter.validationError(res, {
          id: 'Candidate ID is required',
        });
      }

      console.log('📋 Fetching details for candidate ID:', id);

      // Ambil semua kandidat dari blockchain
      const candidates = await BlockchainService.getAllCandidates();

      // Temukan kandidat dengan ID yang cocok
      const candidate = candidates.find(c => String(c.id) === String(id));

      if (!candidate) {
        return ResponseFormatter.notFound(res, `Candidate with ID ${id} not found`);
      }

      console.log(`✅ Found candidate with ID ${id}`);

      return ResponseFormatter.success(
        res,
        candidate,
        `Candidate with ID ${id} retrieved successfully`
      );
    } catch (error) {
      console.error('Get candidate detail error:', error);
      next(error);
    }
  }

}

module.exports = CandidateController;
